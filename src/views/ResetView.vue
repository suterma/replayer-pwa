<!--
 * Copyright (c) 2024 Marcel Suter - Replayer
 *
 * This source code is licensed under the AGPL license found in the
 * LICENSE file in the root of this projects source tree.
-->
<template>
    <div></div>
</template>

<script setup lang="ts">
import { useAppStore } from '@/store/app';
import { useSettingsStore } from '@/store/settings';
import { onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';

/** A simple view that triggers a complete app reset on mount
 */

const router = useRouter();

onBeforeMount(() => {
    useAppStore().$reset();
    useSettingsStore().$reset();

    // To make really sure
    localStorage.clear();
    indexedDB.deleteDatabase('keyval-store');
    indexedDB.deleteDatabase('localforage');

    router.push('/');
});
</script>
