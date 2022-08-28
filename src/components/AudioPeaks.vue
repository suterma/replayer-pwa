<script setup lang="ts">
import { ref, shallowRef, defineProps, onMounted, onUnmounted } from 'vue';
import Peaks from 'peaks.js';

const props = defineProps<{
  /** The audio source URL (for the "simple" mode)
   * @remarks This URL is to be used internally with the default media slot 
   * (no slot template or external media element id is expected)
   */
  src?: string;

  /** The unique identifier of an external zoomview element to use.
* @remarks Allows the use of an external zoomview element.
* (no slot template is expected or used for the zoomview)
*/
  zoomviewElementId?: string;

  /** The zoomview element to use.
  * @remarks Allows the use of an external zoomview element.
  * (no slot template is expected or used for the zoomview)
  */
  zoomviewElement?: HTMLElement;

  /** The unique identifier of an external overview element to use.
 * @remarks Allows the use of an external overview element.
* (no slot template is expected or used for the overview)
 */
  overviewElementId?: string;

  /** The overview element to use.
* @remarks Allows the use of an external overview element.
* (no slot template is expected or used for the overview)
*/
  overviewElement?: HTMLElement;

  /** The unique identifier of an external media element to use. (for the "external" mode)
* @remarks Allows the use of an external media element.
* (no slot template or audio source URL is expected)
*/
  mediaElementId?: string;

  /** The external media element to use. (for the "external" mode)
  * @remarks Allows the use of an external media element.
  * (no slot template or audio source URL is expected)
  */
  mediaElement?: HTMLMediaElement;

  /** The peaks options MUST NOT be deeply reactive for performance reasons.
   * @devdoc See the notes about performance with the peaksInstance property
   */
  options?: Peaks.PeaksOptions;
}>();

/** The peaks instance MUST NOT be deeply reactive for performance reasons.
 * @devdoc See https://github.com/bbc/peaks.js/issues/406#issuecomment-1225885020 in peaks.js
 * and this documentation https://vuejs.org/api/reactivity-advanced.html#shallowref about shallow references
 */
const peaksInstance = shallowRef<Peaks.PeaksInstance | undefined>(undefined);
const overview = shallowRef(null);
const zoomview = shallowRef(null);
const audio = shallowRef(null);
const zoomLevel = ref<number | undefined>(undefined);

onMounted(() => {

  //TODO add a warning when not all required properties (src, id) are set.
  createPeaksInstance();
});

onUnmounted(() => { destroyPeaksInstance(); });


/** Initializes the peaks instance
 * @remarks If no options are provided by the respective component property, some default options are used.
 * @devdoc Must be called only after mount, because the expected HTML elements must be addressable already by their id.
 * @devdoc A currently unused variant for referencing an audio element from the template via reference uses
 * // reference on the component level
 * const audio = shallowRef(null);
 * // getting the element
 * (audio.value as unknown as HTMLAudioElement)
 */
function createPeaksInstance() {
  console.debug("AudioPeaks::createPeaksInstance")

  const defaultOptions: Peaks.PeaksOptions = {
    containers: {
      overview: overview.value as unknown as HTMLElement,
      zoomview: zoomview.value as unknown as HTMLElement,
    },
    /* Either use the audio element from inside the default slot, if available; otherwise get the audio element by id */
    mediaElement: getMediaElement(),
    webAudio: {
      audioContext: new AudioContext(),
    },
    zoomLevels: [256, 512, 1024, 2048, 4096],
  };

  Peaks.init(
    props.options ? props.options : defaultOptions,
    function (err, peaks) {
      console.log(err, peaks);
      peaksInstance.value = peaks;
      zoomLevel.value = peaks?.zoom.getZoom();
    }
  );
}

/** Destroys the peaks instance
 */
function destroyPeaksInstance() {
  console.log("//TODO implement destroyPeaksInstance")
  peaksInstance.value?.destroy();
}

function getMediaElement(): HTMLMediaElement | undefined {
  if (props.mediaElement) {
    console.debug("AudioPeaks::Found mediaElement: ", props.mediaElement)
    return props.mediaElement;
  }
  if (props.mediaElementId) {
    console.debug("AudioPeaks::Found mediaElement by id: ", props.mediaElementId)

    return document.getElementById('' + props.mediaElementId) as HTMLMediaElement;
  }
  const mediaElementByRef = audio.value as unknown as HTMLMediaElement;
  if (mediaElementByRef) {
    console.debug("AudioPeaks::Found mediaElement by Ref")
    return mediaElementByRef;
  }

  console.debug("AudioPeaks::Found mediaElement undefined")
  return undefined;
}

function zoomIn(): void {
  peaksInstance.value?.zoom.zoomIn();
  zoomLevel.value = peaksInstance.value?.zoom.getZoom();
}
function zoomOut(): void {
  peaksInstance.value?.zoom.zoomOut();
  zoomLevel.value = peaksInstance.value?.zoom.getZoom();
}
</script>

<template>
  <!-- If an external overview element is referenced, the default slot is not used -->
  <slot name="overview" v-if="!props.overviewElementId && !props.overviewElement">
    <div class="peaks-overview" ref="overview"></div>
  </slot>
  <!-- If an external zoomview element is referenced, the default slot is not used -->
  <slot name="zoomview" v-if="!props.zoomviewElementId && !props.zoomviewElement">
    <div class="peaks-zoomview" ref="zoomview"></div>
  </slot>
  <!-- If an external media element is referenced, the default slot is not used -->
  <slot name="default" v-if="!props.mediaElementId && !props.mediaElement">
    <!-- The default content slot for the "slot" mode -->
    <audio class="peaks-audio" ref="audio" controls>
      <source :src="src" />
    </audio>
  </slot>
  <slot name="controls">
    <div class="peaks-controls">
      <button @click="zoomIn()">
        Zoom in</button>&nbsp;
      <button @click="zoomOut()">
        Zoom out</button>&nbsp;
      <span>Zoom level: {{ zoomLevel }}</span>
    </div>
  </slot>
</template>

<style scoped>
.peaks-audio,
.peaks-overview,
.peaks-zoomview {
  width: 100%;
}

.peaks-overview,
.peaks-zoomview {
  height: 100px;
}
</style>
