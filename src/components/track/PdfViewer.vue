<template>
    <canvas ref="canvaselement"></canvas>
</template>

<script setup lang="ts">
//import { getDocument } from 'pdfjs-dist';
import { pdfjsLib } from './pdf';
import { onMounted, ref } from 'vue';
import { PDFViewer } from 'pdfjs-dist/web/pdf_viewer';
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

const canvaselement = ref(null);

onMounted(async () => {
    const loadingTask = await pdfjsLib.getDocument(props.mediaUrl);

    loadingTask.promise.then(
        function (pdf) {
            console.log('PDF loaded');

            // Fetch the first page
            var pageNumber = 1;
            pdf.getPage(pageNumber).then(function (page) {
                console.log('Page loaded');

                var scale = 1.0;
                var viewport = page.getViewport({ scale: scale });

                // Prepare canvas using PDF page dimensions
                const canvas =
                    canvaselement.value as unknown as HTMLCanvasElement;
                if (canvas) {
                    var context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    if (context) {
                        // Render PDF page into canvas context
                        var renderContext = {
                            canvasContext: context,
                            viewport: viewport,
                        };
                        if (renderContext) {
                            var renderTask = page.render(renderContext);
                            renderTask.promise.then(function () {
                                console.log('Page rendered');
                            });
                        }
                    }
                }
            });
        },
        function (reason) {
            // PDF loading error
            console.error(reason);
        },
    );
});
</script>
