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
    console.debug('Reset::onBeforeMount');

    useAppStore().discardCompilation();
    useSettingsStore().$reset();

    router.push('/');
});
</script>
