<template>
    <div
        class="pdfContainer"
        ref="pdfContainer"
        :style="{
            'min-height': isFullscreen ? '100vh' : availableHeight + 'px',
            'max-height': isFullscreen ? '100vh' : availableHeight + 'px',
            width: '100%',
        }"
    ></div>
</template>

<script setup lang="ts">
/** A track variant that displays a PDF document, either as link or as an expandable inline viewer */
import { computed, ref, inject, onMounted, onUpdated } from 'vue';

import PDFObject from 'pdfobject';
import VueScrollTo from 'vue-scrollto';

const props = defineProps({
    /** The PDF URL
     */
    mediaUrl: {
        type: String,
        required: true,
    },

    /** Whether to show the PDF are in full screen (full height)
     */
    isFullscreen: {
        type: Boolean,
        required: true,
    },
});

import { navbarCompensationHeightInjectionKey } from '@/AppInjectionKeys';
const navbarCompensationHeight = inject(navbarCompensationHeightInjectionKey);

/** Gets the net available available window height
 * @remarks This is used for convenience to the user, to minimize
 * required vertical scrolling, while observing the application's navbar(s)
 */
const availableHeight = computed(() => {
    const fullvh = Math.round(window.innerHeight);
    if (props.isFullscreen) {
        return fullvh;
    }
    const availableHeight = fullvh - (navbarCompensationHeight?.value ?? 0);
    return availableHeight;
});

const initPDF = () => {
    if (pdfContainer.value) {
        console.debug(
            'PdfElement::Rendering PDF for mediaUrl: ',
            props.mediaUrl,
        );
        PDFObject.embed(props.mediaUrl, pdfContainer.value, {
            pdfOpenParams: { view: 'FitH' },
            //TODO use proper CSP in combination with the sandbox
            //customAttribute: { key: 'sandbox', value: 'true' },
            height: props.isFullscreen ? '100vh' : availableHeight.value + 'px',
            width: '100%',
            forcePDFJS: true,
            PDFJS_URL: '/pdfjs/web/viewer.html',
        });

        /** When using non-full-screen, scroll back to the pdf viewport */
        if (!props.isFullscreen) {
            scrollToPdf();
        }
    }
};

onMounted(initPDF);
onUpdated(initPDF);

const pdfContainer = ref(null);

/** Visually scrolls to the PDF, making it visually at the top of
 * the view.
 */
function scrollToPdf() {
    console.debug('PdfElement::scrollToPdf');
    VueScrollTo.scrollTo(pdfContainer.value, {
        /** Always scroll, make it on top of the view */
        force: true,
        /** empirical value (taking into account the non-existing fixed top navbar) */
        offset: 0,
        /** Avoid interference with the key press overlay */
        cancelable: false,
    });
}
</script>

<style>
.pdfobject-container {
    position: absolute;
}
</style>
