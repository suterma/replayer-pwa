import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';
import * as pdfWorker from 'pdfjs-dist/legacy/build/pdf.worker.js';

// Setting worker path to worker bundle.
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export { pdfjsLib };
