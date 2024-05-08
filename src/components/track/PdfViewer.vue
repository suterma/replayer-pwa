<template>
    <div style="height: 100px; width: 100%">
        <div ref="pageContainer" class="pageContainer">
            <div ref="viewer" class="pdfViewer"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
//import { getDocument } from 'pdfjs-dist';
import { pdfjsLib } from './pdf';
import { onMounted, ref } from 'vue';
import { EventBus, PDFViewer } from 'pdfjs-dist/web/pdf_viewer';
import 'pdfjs-dist/web/pdf_viewer.css';

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

const pageContainer = ref(null);
const viewer = ref(null);

onMounted(async () => {
    const loadingTask = await pdfjsLib.getDocument(props.mediaUrl);

    loadingTask.promise.then(
        function (pdf) {
            console.log('PDF loaded');
            const pdfViewer = new PDFViewer({
                container: pageContainer.value as unknown as HTMLDivElement,
                eventBus: new EventBus(),
                viewer: viewer.value as unknown as HTMLDivElement,
            });
            pdfViewer.setDocument(pdf);
        },
        function (reason) {
            // PDF loading error
            console.error(reason);
        },
    );
});
</script>

<style>
div.pageContainer {
    display: inline-block;
    position: absolute;
    overflow: scroll;
    height: 100px;
    width: 100%;
}
div.pdfViewer {
    display: inline-block;
    width: 100%;
}
</style>
