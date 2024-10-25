<template>
    <div>
        <!--Eruda - Console for Mobile Browsers.-->
    </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

/** Displays a mobile variant of dev tools, usable on phones and tablets
 * @remarks Internally loads eruda, from a CDN
 * @devdoc This script handling could be improved, by referencing and actually
 * removing the script elements once they are not used anymore.
 */
onMounted(() => {
    const eruda = document.createElement('script') as HTMLScriptElement;
    eruda.src = '//cdn.jsdelivr.net/npm/eruda';
    eruda.onload = initEruda;
    document.body.appendChild(eruda);
});

function initEruda() {
    const init = document.createElement('script');
    init.text = 'eruda.init();';
    document.body.appendChild(init);
}

/** Displays a mobile variant of dev tools, usable on phones and tablets
 * @remarks Internally loads eruda, from a CDN
 */
onUnmounted(() => {
    const destroy = document.createElement('script');
    destroy.text = 'eruda.destroy();';
    document.body.appendChild(destroy);
});
</script>
