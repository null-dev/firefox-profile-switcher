<style>
    @import "./popupcontent.css" scoped;
</style>
<script lang="ts">
    import {loadAvatarIntoImageAction} from "~/lib/common";
    import type {Profile} from "~/lib/model/profiles";

    export let fakeHover: boolean = false;
    export let profile: Profile;
</script>
<div class="profile-entry" class:fake-hover={fakeHover}>
    <img class="profile-entry-pic"
         use:loadAvatarIntoImageAction={profile.avatar}
         alt="Profile avatar" />
    <div class="profile-entry-name">{profile.name}</div>
    <div class="profile-entry-float-clear"></div>
</div>
