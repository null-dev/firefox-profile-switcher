<style>
    .profile-list {
        display: flex;
        flex-direction: row;
        padding: 12px;
        flex-wrap: wrap;
        justify-content: center;
    }
</style>

<script lang="ts">
import ProfileCard from "./ProfileCard.svelte";
import {profileListStore} from "~/lib/common";
import {scale} from "svelte/transition";

$: profiles = $profileListStore?.profiles;
</script>

{#if profiles != null}
    <div class="profile-list">
        {#each profiles as profile (profile.id)}
            <div transition:scale|local={{delay: 250}}>
                <ProfileCard {profile} />
            </div>
        {/each}
    </div>
{/if}