<template>
    <div></div>
</template>

<script setup lang="ts">
import { ActionTypes } from '@/store/action-types';
import { onBeforeMount } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

/** A simple view that triggers a complete app reset on mount
 */

const store = useStore();
const router = useRouter();

onBeforeMount(() => {
    console.debug('Reset::onBeforeMount');
    store.dispatch(ActionTypes.RESET_APPLICATION).then(() => {
        router.push('/');
    });
});
</script>
