@file:DependsOn("org.jsoup:jsoup:1.15.3")
@file:DependsOn("com.fasterxml.jackson.module:jackson-module-kotlin:2.14.1")

import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.databind.annotation.JsonNaming
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import org.jsoup.Jsoup
import org.jsoup.nodes.Element
import java.io.File

val AVATARS_FOLDER = File("../../../public/img/avatars")

val INPUT_FOLDERS = listOf(
    InputFolder("modern_cros_100", "modern_cros_data.xml"),
    InputFolder("modern_cros_200", "modern_cros_data.xml"),
    InputFolder("old", "old_data.xml"),
)

val VALID_EXTENSIONS = listOf(
    "png",
    "jpg",
    "jpeg"
)

val OUTPUT_FILE = File("avatarlist.json")

val objectMapper = jacksonObjectMapper()

data class InputFolder(
    val folderName: String,
    val dataFileName: String,
)

data class Avatar(
    @JsonProperty("p")
    val relativePath: String,
    @JsonProperty("n")
    val name: String,
    @JsonProperty("k")
    val nickname: String?
)

data class AvatarData(
    val name: String,
    val nickname: String?
)

fun parseXMLFragment(file: File): Element {
    val read = file.readText()
    val parsed = Jsoup.parseBodyFragment(read)
    return parsed.body().children().single() ?: error("XML fragment does not contain root element!")
}

fun processDataFile(file: File): Map<String, AvatarData> {
    try {
        val xml = parseXMLFragment(file)
        return processChromeDataFile(xml)
    } catch(e: Exception) {
        throw RuntimeException("Failed to process data file: $file", e)
    }
}

val OLD_NICKNAMES_IN_PREFIX = "IDS_DEFAULT_AVATAR_NAME_"
val OLD_NICKNAMES_OUT_PREFIX = "IDS_DEFAULT_AVATAR_LABEL_"
fun processChromeDataFile(root: Element): Map<String, AvatarData> {
    require(root.attr("type") == "chrome")
    // Process <mappings> tags
    val fileToName = root.children().asIterable().filter { it.tagName() == "mappings" }.flatMap { mappings ->
        val removePrefix = mappings.attr("remove-prefix").takeIf { it.isNotBlank() }
        val addPrefix = mappings.attr("add-prefix").takeIf { it.isNotBlank() }
        mappings.children().map { mapping ->
            require(mapping.tagName() == "structure")
            val name = mapping.attr("name")
            var file = mapping.attr("file")
            if(removePrefix != null) {
                require(file.startsWith(removePrefix))
                file = file.removePrefix(removePrefix)
            }
            if(addPrefix != null) {
                file = addPrefix + file
            }
            file to name
        }
    }
    // Process <avatar-to-label> tags
    val avatarToLabel = root.children().asIterable().filter { it.tagName() == "avatar-to-label" }.flatMap { a2l ->
        val regex = Regex(a2l.attr("regex"))
        a2l.wholeText().lines().map { it.trim() }.filter { it.isNotBlank() }.map {
            val match = regex.matchEntire(it) ?: error("avatar-to-label line is badly formatted: $it")
            val (avatar, label) = match.destructured
            avatar to label
        }
    }.toMap()
    // Process <translations> tags
    val translations = mutableMapOf<String, String>()
    val nicknames = mutableMapOf<String, String>()
    run {
        for(translationsElement in root.children().asIterable().filter { it.tagName() == "translations" }) {
            val parsed = translationsElement.children().map {
                it.attr("name") to it.text()
            }
            when(translationsElement.attr("special")) {
                "old_nicknames" -> {
                    nicknames.putAll(parsed.map { (k, v) ->
                        require(k.startsWith(OLD_NICKNAMES_IN_PREFIX))
                        (OLD_NICKNAMES_OUT_PREFIX + k.removePrefix(OLD_NICKNAMES_IN_PREFIX)) to v
                    })
                }
                else -> {
                    translations.putAll(parsed)
                }
            }
        }
    }
    // Process <avatar-to-translation> tags
    val avatarTranslations = root.children().asIterable().filter { it.tagName() == "avatar-to-translation" }.flatMap { a2t ->
        objectMapper.readValue<Map<String, String>>(a2t.wholeText()).toList()
    }.toMap()
    // Combine all the processed data
    return fileToName.associate { (file, name) ->
        val realName = avatarToLabel[name]
        file to AvatarData(
            avatarTranslations[name]
                ?: translations[realName ?: error("no label for avatar: $name")]
                ?: error("no translation for: $realName"),
            realName?.let { nicknames[it] }
        )
    }
}

fun processFolder(folder: InputFolder): List<Avatar> {
    val dataFile = processDataFile(File(AVATARS_FOLDER, folder.dataFileName))
    return File(AVATARS_FOLDER, folder.folderName).walkBottomUp().filter {
        it.isFile && it.extension in VALID_EXTENSIONS
    }.map { file ->
        val relPath = file.toRelativeString(AVATARS_FOLDER)
        val data = dataFile[relPath] ?: error("no data for: $relPath")
        Avatar(
            relPath,
            data.name,
            data.nickname
        )
    }.toList()
}

val avatars = INPUT_FOLDERS.flatMap {
    processFolder(it)
}.sortedBy { it.relativePath }

objectMapper.writeValue(OUTPUT_FILE, avatars)