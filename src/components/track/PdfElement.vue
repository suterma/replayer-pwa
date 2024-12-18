<template>
    <a
        v-if="usePdfLinkFallback"
        :href="url"
        alt="Show this track's PDF in an external viewer"
        target="_blank"
        >{{ url }}</a
    >
    <div
        v-else
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
import useLog from '@/composables/LogComposable';
import { navbarCompensationHeightInjectionKey } from '@/AppInjectionKeys';

const { log } = useLog();
const props = defineProps({
    /** The PDF URL
     */
    url: {
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

const pdfContainer = ref<HTMLElement | null>(null);

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
        log.debug('PdfElement::Rendering PDF for mediaUrl: ', props.url);
        try {
            const success = PDFObject.embed(props.url, pdfContainer.value, {
                pdfOpenParams: { view: 'FitH' },
                height: props.isFullscreen
                    ? '100vh'
                    : availableHeight.value + 'px',
                width: '100%',
                forcePDFJS: false,
                PDFJS_URL: '/pdfjs/web/viewer.html?v=2',
            });
            if (!success) {
                log.warn('PdfElement::Rendering failed');
                usePdfLinkFallback.value = true;
            }
        } catch (error) {
            log.warn('PdfElement::Rendering failed because: ', error);
            usePdfLinkFallback.value = true;
        }
    }
};

onMounted(initPDF);
onUpdated(initPDF);

const usePdfLinkFallback = ref(false);
</script>

<style>
/** This class is generated by PDFObject */
.pdfobject-container {
    position: absolute;
    left: 0;
    right: 0;
    /** keep the PDF inside the track outline */
    display: contents;
    overflow: hidden;
}
</style>
