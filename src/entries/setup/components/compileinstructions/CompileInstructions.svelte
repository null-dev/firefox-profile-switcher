<ol>
    <li>Clone <a href="https://github.com/null-dev/firefox-profile-switcher-connector" target="_blank">this</a> git repository.</li>
    <li>Compile the program. Usually this involves running this command: <code>cargo build --verbose --release</code></li>
    <li>You will find the compiled binary here: <code>target/release/firefox_profile_switcher_connector</code>. Place it somewhere sensible in your system.</li>
    <li>Copy the <code>manifest/manifest-linux.json</code> file to: <code>~/.mozilla/native-messaging-hosts/ax.nd.profile_switcher_ff.json</code>. Replace the <code>path</code> field in the file with the location of the compiled binary.</li>
    <li>Restart your browser.</li>
</ol>
