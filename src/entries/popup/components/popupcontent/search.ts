import type {Profile, ProfileList} from "~/lib/model/profiles";
import Fuse from "fuse.js";
import type {ADTEnum} from "~/lib/util/types";

function chunkFuseMatches(matches): SearchResult[] {
    return matches.map(result => {
        let itemName = result.item.name;
        let match = result.matches[0];
        let chunks: SearchResultMatchChunk[] = [];
        let lastChunkEnd = 0;
        for(const chunk of match.indices) {
            if(lastChunkEnd < chunk[0]) {
                chunks.push({
                    range: itemName.substring(lastChunkEnd, chunk[0]),
                    match: false
                });
            }
            lastChunkEnd = chunk[1] + 1;
            chunks.push({
                range: itemName.substring(chunk[0], chunk[1] + 1),
                match: true
            });
        }
        let lastIndex = itemName.length - 1;
        let lastMatchIndex = match.indices[match.indices.length - 1][1];
        if(lastMatchIndex !== lastIndex) {
            chunks.push({
                range: itemName.substring(lastMatchIndex + 1, lastIndex + 1),
                match: false
            });
        }
        return {
            item: result.item,
            chunks
        };
    });
}

export interface SearchResultMatchChunk {
    range: string
    match: boolean
}

export interface SearchResult {
    item: Profile,
    chunks: SearchResultMatchChunk[]
}

export interface SearchEngine {
    search(query: string): SearchResult[]
}

export function buildSearchEngine(profileList: ProfileList): SearchEngine {
    const currentProfilesFuse = new Fuse(profileList.profiles, {
        keys: ['name'],
        includeMatches: true
    });

    return {
        search: (query: string) => {
            let searchResult = currentProfilesFuse.search(query);
            return chunkFuseMatches(searchResult);
        }
    }
}

export type PopupSelection = ADTEnum<"kind", {
    profile: { id: string },
    manageButton: {}
}>;
