<!--
 * Copyright (c) 2024 Marcel Suter - Replayer
 *
 * This source code is licensed under the AGPL license found in the
 * LICENSE file in the root of this projects source tree.
-->
<template>
    <!-- Note: This template is not actually used but provided here to avoid a warning -->
    <p>Loading the demo....</p>
</template>

<script
    setup
    lang="ts"
>
/** A view for demo purposes
 * @remarks Just loads the demo compilation and navigates to the play view.
 */

import { Route } from '@/router';
import { useAppStore } from '@/store/app';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import useLog from '@/composables/LogComposable';

const { log } = useLog();
const router = useRouter();

onMounted(() => {
    loadDemo();
    router.push(Route.Play);
});

function loadDemo() {
    const demoCompilationUrl =
        //'https://lib.replayer.app/demo/demo-compilation-featuring-lidija-roos-with-info.xml';
        'https://lib.replayer.app/demo/demo-compilation-featuring-lidija-roos.xml';
    log.debug('DemoView::loadDemo:', demoCompilationUrl);
    useAppStore()
        .loadFromUrl(demoCompilationUrl)
        .catch((errorMessage: string) => {
            log.error(errorMessage);
        });
}
</script>
