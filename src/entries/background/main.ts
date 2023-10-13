import browser from "webextension-polyfill";
import type {Action} from "webextension-polyfill";
import {initNative} from "~/lib/native";
import {nativeLaunchProfile} from  "~/lib/native";
import {
  EXTENSION_ID,
  fetchAndRoundAvatarAsCanvas, REQUEST_TYPE_CLOSE_MANAGER, STORAGE_CACHE_CUSTOM_AVATARS, STORAGE_CACHE_GLOBAL_OPTIONS,
  STORAGE_CACHE_PROFILE_LIST, STORAGE_CACHE_PROFILE_ORDER,
  STORAGE_NATIVE_CONNECTOR_VERSION
} from "~/lib/common";

async function handleEvent(event) {
  console.log("Incoming native event!", event);

  if(event.event === "ConnectorInformation") {
    browser.storage.local.set({[STORAGE_NATIVE_CONNECTOR_VERSION]: event.version});
  } else if(event.event === "ProfileList") {
    // Sort profiles
    event.profiles.sort((a, b) => a.name.localeCompare(b.name));

    browser.storage.local.set({[STORAGE_CACHE_PROFILE_LIST]: event});

    // Update browser action icon
    if(event.current_profile_id != null) {
      const currentProfile = event.profiles.find(it => it.id === event.current_profile_id);
      if(currentProfile != null) {
        const {canvas, context} = await fetchAndRoundAvatarAsCanvas(currentProfile.avatar);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        browser.browserAction.setIcon({imageData: imageData as Action.ImageDataType});
      }
    }
  } else if(event.event === "FocusWindow") {
    let windowId;
    if(event.url != null) {
      try {
        const newTab = await browser.tabs.create({url: event.url});
        windowId = newTab.windowId;
      } catch(e) {
        console.error("Failed to create new tab!", e);
      }
    } else {
      const curWindow = await browser.windows.getLastFocused({populate:false});
      if(curWindow != null)
        windowId = curWindow.id;
    }
    if(windowId != null)
      browser.windows.update(windowId, {focused:true});
  } else if(event.event === "CloseManager") {
    browser.runtime.sendMessage({
      type: REQUEST_TYPE_CLOSE_MANAGER
    });
  } else if(event.event === "OptionsUpdated") {
    browser.storage.local.set({[STORAGE_CACHE_GLOBAL_OPTIONS]: event.options});
  } else if(event.event === "AvatarsUpdated") {
    browser.storage.local.set({[STORAGE_CACHE_CUSTOM_AVATARS]: event.avatars});
  } else if(event.event === "ProfileOrderUpdated") {
    browser.storage.local.set({[STORAGE_CACHE_PROFILE_ORDER]: event.order});
  }
}

// Function to handle a specific profile selection from the context menu
async function handleProfileSelection(info, tab) {
  console.log("Profile selected from context menu.");
  console.log(info);
  console.log(tab);

  const selectedProfile = info.menuItemId.split('-')[1]; // Extract profile name from the ID

  const urlToOpen = info.pageUrl;
  console.log(`URL to open with profile: ${urlToOpen}`);

  // Fetch the list of profiles from storage
  const profileListData = await browser.storage.local.get(STORAGE_CACHE_PROFILE_LIST);

  if (profileListData && profileListData[STORAGE_CACHE_PROFILE_LIST]) {
      // Find the profile with the name entered by the user
      const desiredProfile = profileListData[STORAGE_CACHE_PROFILE_LIST].profiles.find(profile => profile.name === selectedProfile);

      if (desiredProfile) {
          // Use the ID of the selected profile to call nativeLaunchProfile
          await nativeLaunchProfile(desiredProfile.id, urlToOpen);
          console.log(`Profile "${selectedProfile}" launched successfully with URL: ${urlToOpen}`);
      } else {
          console.error(`Profile "${selectedProfile}" not found!`);
      }
  } else {
      console.error('Failed to retrieve profiles from storage!');
  }
}

// Create a context menu
browser.contextMenus.create({
  id: "switch-profile",
  title: "Open with another profile...",
  contexts: ["page"]
});

// Add profiles to the context menu
async function addProfilesToContextMenu() {
  const profileListData = await browser.storage.local.get(STORAGE_CACHE_PROFILE_LIST);

  if (profileListData && profileListData[STORAGE_CACHE_PROFILE_LIST]) {
      for (const profile of profileListData[STORAGE_CACHE_PROFILE_LIST].profiles) {
          browser.contextMenus.create({
              id: `profile-${profile.name}`,
              title: profile.name,
              parentId: "switch-profile",
              contexts: ["page"],
              onclick: handleProfileSelection
          });
      }
  } else {
      console.error('Failed to retrieve profiles from storage!');
  }
}

// Call the function to add profiles to the context menu
addProfilesToContextMenu();

initNative(handleEvent);

// Listen for when the winfocus page is launched and close it as fast as possible
browser.tabs.onCreated.addListener(function(tab) {
  if(tab.title === EXTENSION_ID + "/src/entries/winfocus/index.html") {
    browser.tabs.remove(tab.id);
  }
});
