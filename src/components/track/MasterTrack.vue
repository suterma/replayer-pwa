<template>
    <div class="track is-together-print block" data-cy="track-master">
        <!-- Handle all track-relevant events here
        Note: A check for the active track is done in the handler methods. 
        A v-if here would work, but would register the events not in a useful order. -->
        <div data-v-9b701c96="">
            <!-- ReplayerEventHandler --><!-- this should get removed, but empty templates are not allowed -->
        </div>
        <div data-v-9b701c96="" class="block">
            <!-- Each track is an item in a list and contains all the cues --><!-- Track header for editing, including artist info, expansion-toggler and adaptive spacing --><!-- NOTE: The @click handler on the header component only handles clicks on otherwise non-interactive elements --><!-- Header level with wrap for items in the left part.
         Using flex-start on the level, to cause the left and right parts to both 
         begin at the same, upper vertical position -->
            <div
                data-v-1ea64311=""
                data-v-9b701c96=""
                class="track-header level is-mobile is-align-items-flex-start"
            >
                <!-- Left side -->
                <div
                    class="level-left level-wrap is-justify-content-flex-start"
                >
                    <!-- Slot for prepending level items -->
                    <div class="level-item is-narrow">
                        <PlayPauseButton
                            :disabled="!isAllTrackLoaded"
                            :class="{
                                'is-success': isAllTrackLoaded,
                                'is-clickable': isAllTrackLoaded,
                                'has-cursor-not-allowed': !isAllTrackLoaded,
                            }"
                            :is-loading="isAnyFading"
                            data-cy="toggle-playback-master"
                            @click="multitrack.togglePlaybackAll()"
                        />

                        isAllTrackLoaded :{{ isAllTrackLoaded }} isAllTrackMuted
                        :{{ isAllTrackMuted }} isAllTrackSoloed :
                        {{ isAllTrackSoloed }} isAllPlaying :
                        {{ isAllPlaying }}

                        isAllPaused :
                        {{ isAllPaused }}
                        isAllMediaAvailable:
                        {{ isAllMediaAvailable }} isAnyFading :
                        {{ isAnyFading }}

                        <!-- Title input --><!-- The title is the only header element that should shrink (break on words) if necessary -->
                        <div
                            data-v-9b701c96=""
                            class="is-flex-shrink-1 ml-3 is-clickable"
                        >
                            <p
                                data-v-9b701c96=""
                                class="title is-4"
                                title="17.mp3"
                            >
                                <span
                                    data-v-9b701c96=""
                                    class="has-text-weight-light"
                                    data-cy="track-name"
                                    >MASTER</span
                                >
                            </p>
                        </div>
                        <!-- Routing controls only when mixable --><button
                            data-v-8441256a=""
                            data-v-9b701c96=""
                            class="button is-warning is-yellow is-inactive has-tooltip-arrow has-tooltip-multiline has-tooltip-text-centered has-tooltip-fade"
                            data-cy="solo"
                            data-tooltip="Listen solo"
                        >
                            S</button
                        ><button
                            data-v-9b701c96=""
                            class="button is-danger is-inactive has-tooltip-arrow has-tooltip-multiline has-tooltip-text-centered has-tooltip-fade"
                            data-cy="mute"
                            data-tooltip="Mute"
                        >
                            M</button
                        ><button
                            data-v-9b701c96=""
                            class="button is-primary is-inactive has-tooltip-arrow has-tooltip-multiline has-tooltip-text-centered has-tooltip-fade"
                            data-cy="select"
                            data-tooltip="Select"
                        >
                            SEL
                        </button>
                    </div>
                    <!-- Expander --><!--v-if--><!-- The edit part --><!-- Artist info (should not take too much width, and hide on small displays anyways)-->
                    <div data-v-1ea64311="" class="level-item is-hidden-mobile">
                        <p data-v-1ea64311="" class="is-size-7">
                            <!-- <span
        class="is-flex is-flex-direction-row is-flex-wrap-wrap is-justify-content-flex-start is-align-content-center has-cropped-text"
    > --><span
                                data-v-1ea64311=""
                                class="has-cropped-text"
                                style="max-width: 25vw"
                                ><!--v-if--><!--v-if--></span
                            >
                        </p>
                    </div>
                    <!-- Slot for additional level items -->
                </div>
                <!-- Right side -->
                <div
                    data-v-1ea64311=""
                    class="level-right is-justify-content-flex-end"
                >
                    <div data-v-1ea64311="" class="level-item">
                        <!-- Slot for additional level display items --><!-- NOTE: As a component update performance optimization, 
                    the numeric value is truncated to one decimal digit, as displayed, avoiding
                    unnecessary update for actually non-distinctly displayed values. --><!--v-if--><!-- NOTE: In edit mode, the time is displayed as part of the transport area, not in the header --><!-- NOTE: In mix mode, the time display is not needed on individual tracks --><!-- NOTE: In playback mode, the currently remaining time is shown, to indicate any ongoing playback action --><!-- NOTE: As a component update performance optimization, 
                    the numeric value is truncated to one decimal digit, as displayed, avoiding
                    unnecessary update for actually non-distinctly displayed values. --><!--v-if--><!-- Placeholder for the audio level meter (used for teleporting from the player component) -->
                        <div
                            data-v-9b701c96=""
                            class="level-item is-narrow mr-0"
                        >
                            <div data-v-9b701c96="" class="is-clickable">
                                <span
                                    data-v-9b701c96=""
                                    id="track-d70eeaab-0731-4a46-bac9-42eb7faa2238-HeaderLevelPlaceholder"
                                ></span>
                            </div>
                        </div>
                        <!--v-if--><!-- Slot for additional level action items -->
                        <div
                            data-v-9b701c96=""
                            class="level-item is-narrow mr-0 is-hidden-mobile"
                        >
                            <!-- NOTE: In edit mode, the volume button is displayed as part of the transport area, not in the header --><button
                                data-v-9b701c96=""
                                class="button is-nav pl-0 pr-0 has-tooltip-arrow has-tooltip-multiline has-tooltip-text-centered has-tooltip-fade has-tooltip-left has-tooltip-inactive"
                                data-tooltip="-6.0 dBFS"
                            >
                                <svg
                                    width="40"
                                    height="40"
                                    viewBox="0 0 100 100"
                                    role="slider"
                                    aria-label="Knob"
                                    aria-valuemin="0"
                                    aria-valuemax="1"
                                    aria-valuenow="0.5"
                                    tabindex="0"
                                    class="has-text-light is-knob is-unselectable"
                                    title="Drag, scroll or use the arrow keys to change volume"
                                    data-cy="volume"
                                >
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        stroke="currentColor"
                                        fill="currentColor"
                                        class="has-text-grey-dark"
                                        stroke-width="1"
                                    ></circle>
                                    <path
                                        d="M 30 84.64101615137756 A 40 40 0 1 1 70 84.64101615137756"
                                        stroke-width="4"
                                        stroke="currentColor"
                                        fill="none"
                                        class="has-text-grey-light"
                                    ></path>
                                    <path
                                        d="M 30 84.64101615137756 A 40 40 0 0 1 49.99999999999999 10"
                                        stroke-width="10"
                                        stroke="currentColor"
                                        fill="none"
                                        class="has-text-light"
                                    ></path>
                                    <line
                                        x1="49.99999999999999"
                                        y1="16"
                                        x2="49.99999999999999"
                                        y2="2"
                                        stroke="currentColor"
                                        stroke-width="8"
                                        class="has-text-light"
                                    ></line>
                                    <!--v-if-->
                                </svg>
                            </button>
                        </div>
                        <button
                            data-v-a32c4500=""
                            data-v-1ea64311=""
                            class="button is-nav is-indicator has-text-grey has-tooltip-arrow has-tooltip-multiline has-tooltip-text-centered has-tooltip-fade has-tooltip-left"
                            title=""
                            tabindex="0"
                            data-cy="playback-indicator"
                            data-tooltip="Track is loaded and ready to play"
                        ></button
                        ><!--v-if-->
                    </div>
                    <!-- Slot for additional level items -->
                </div>
            </div>
        </div>
        <!-- The buttons field (for a single track in play mode) --><!--v-if--><!-- The meter and cue level editors and playback bar (in edit mode for an expanded track)
         --><!--v-if--><!-- Main container --><!--v-if--><!-- 
                Track playback bar (In edit mode, this contains:
                - the play/pause-add-cue button combo
                - a wide slider
                - a very limited set of transport controls (no skip buttons)
                    --><!--v-if--><!-- The media player widget (with controls) but only once the source is available from the store
            Note: The mediaUrl property (the actual src attribute in the underlying media
            element) is also depending on the track state as a performance optimizations
            -->
        <div data-v-9b701c96="" class="block">
            <!--teleport start--><!-- The player widget for a track may be full screen only for the active track -->
            <div data-v-9b701c96="">
                <div
                    data-v-9b701c96=""
                    class="section transition-in-place has-background-grey-dark"
                    disabled="false"
                    style="display: none"
                >
                    <!-- The messages need to be shown inside the native fullscren element; otherwise they would get hidden below --><!--v-if--><!-- 
                            Track playback bar (In play mode, this contains:
                            - a slot for the expander icon (if not the only track)
                            - The title (with artist info)
                            - the play/pause button
                            - a smaller slider (hiddeon on mobile for videos)
                            - a standard set of transport controls, including cue and track skipping
                         --><!-- 
                            In full screen, this level is at the top, and not visually separated from the cues --><!--v-if--><!-- Offer the cue buttons as bar or block, depending on the situation. -->
                    <div data-v-9b701c96="" class="block next-is-empty">
                        <!--v-if-->
                        <div data-v-9b701c96="">
                            <div
                                data-v-9b701c96=""
                                class="cue-buttons-bar buttons field has-addons is-fullwidth is-flex-wrap-nowrap"
                            >
                                <!-- A virtual cue button as prefix, when the first cue is not at the zero position --><!-- Note: Do not crop the (non-existing) text in virtual cue buttons
             Also, leave the existing flex-grow, to allow them to fill single lines, but allow to shrink --><!--v-if--><!-- Using the v-for on a template instead of the actual component saves unnecessary renderings. 
             See https://stackoverflow.com/a/76074016/79485 --><button
                                    data-v-c6a7496b=""
                                    class="button cue has-text-left is-flex-grow-1 has-cropped-text is-warning"
                                    title="Play from Vers 1"
                                    data-cy="cue-button"
                                    id="ed06b4b4-d7a9-4a48-9ae4-cc521f5b2063"
                                >
                                    <!-- Use the full width of the button for the inside content
        This causes the icon and description to start from the left side, 
        representing the begin of the cue, which suits the intention --><!-- Do not handle click events here; they should originate from the outer button --><span
                                        data-v-c6a7496b=""
                                        class="player-timeline is-fullwidth"
                                        style="pointer-events: none"
                                        ><!-- Progress --><span
                                            data-v-c6a7496b=""
                                            class="player-progress has-addons-right player-progress-none"
                                        ></span
                                        ><!-- First line (Do not use a level here, this has only complicated things for smaller widths so far)--><!-- NOTE: For performance reasons, this icon is implemented inline, not using the BaseIcon SFC --><i
                                            data-v-c6a7496b=""
                                            class="icon mdi foreground"
                                            ><svg
                                                data-v-c6a7496b=""
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    data-v-c6a7496b=""
                                                    fill="currentColor"
                                                    d="M8,5.14V19.14L19,12.14L8,5.14Z"
                                                ></path></svg></i
                                        ><!-- Text depending on variant --><span
                                            data-v-c6a7496b=""
                                            class="has-text-weight-semibold foreground is-size-7"
                                            >Vers 1</span
                                        ><!--v-if--><!-- NOTE: For performance reasons, this icon is implemented inline, not using the BaseIcon SFC --><i
                                            data-v-c6a7496b=""
                                            class="icon mdi ml-2 mr-2 foreground"
                                            ><svg
                                                data-v-c6a7496b=""
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    data-v-c6a7496b=""
                                                    fill="currentColor"
                                                    d=""
                                                ></path></svg></i
                                        ><!-- second line, if not minified (use a horizontal level also on mobile)--><!--v-if--></span
                                    ></button
                                ><button
                                    data-v-c6a7496b=""
                                    class="button cue has-text-left is-flex-grow-1 has-cropped-text is-warning"
                                    title="Play from Vers 2"
                                    data-cy="cue-button"
                                    id="f54dcd24-dfba-41fe-a259-a2c6b3141966"
                                >
                                    <!-- Use the full width of the button for the inside content
        This causes the icon and description to start from the left side, 
        representing the begin of the cue, which suits the intention --><!-- Do not handle click events here; they should originate from the outer button --><span
                                        data-v-c6a7496b=""
                                        class="player-timeline is-fullwidth"
                                        style="pointer-events: none"
                                        ><!-- Progress --><span
                                            data-v-c6a7496b=""
                                            class="player-progress has-addons-right player-progress-none"
                                        ></span
                                        ><!-- First line (Do not use a level here, this has only complicated things for smaller widths so far)--><!-- NOTE: For performance reasons, this icon is implemented inline, not using the BaseIcon SFC --><i
                                            data-v-c6a7496b=""
                                            class="icon mdi foreground"
                                            ><svg
                                                data-v-c6a7496b=""
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    data-v-c6a7496b=""
                                                    fill="currentColor"
                                                    d="M8,5.14V19.14L19,12.14L8,5.14Z"
                                                ></path></svg></i
                                        ><!-- Text depending on variant --><span
                                            data-v-c6a7496b=""
                                            class="has-text-weight-semibold foreground is-size-7"
                                            >Vers 2</span
                                        ><!--v-if--><!-- NOTE: For performance reasons, this icon is implemented inline, not using the BaseIcon SFC --><i
                                            data-v-c6a7496b=""
                                            class="icon mdi ml-2 mr-2 foreground"
                                            ><svg
                                                data-v-c6a7496b=""
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    data-v-c6a7496b=""
                                                    fill="currentColor"
                                                    d=""
                                                ></path></svg></i
                                        ><!-- second line, if not minified (use a horizontal level also on mobile)--><!--v-if--></span
                                    ></button
                                ><button
                                    data-v-c6a7496b=""
                                    class="button cue has-text-left is-flex-grow-1 has-cropped-text is-warning"
                                    title="Play from Pre-Chorus (1)"
                                    data-cy="cue-button"
                                    id="2734de68-840c-4427-958a-b179e64eb682"
                                >
                                    <!-- Use the full width of the button for the inside content
        This causes the icon and description to start from the left side, 
        representing the begin of the cue, which suits the intention --><!-- Do not handle click events here; they should originate from the outer button --><span
                                        data-v-c6a7496b=""
                                        class="player-timeline is-fullwidth"
                                        style="pointer-events: none"
                                        ><!-- Progress --><span
                                            data-v-c6a7496b=""
                                            class="player-progress has-addons-right player-progress-none"
                                        ></span
                                        ><!-- First line (Do not use a level here, this has only complicated things for smaller widths so far)--><!-- NOTE: For performance reasons, this icon is implemented inline, not using the BaseIcon SFC --><i
                                            data-v-c6a7496b=""
                                            class="icon mdi foreground"
                                            ><svg
                                                data-v-c6a7496b=""
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    data-v-c6a7496b=""
                                                    fill="currentColor"
                                                    d="M8,5.14V19.14L19,12.14L8,5.14Z"
                                                ></path></svg></i
                                        ><!-- Text depending on variant --><span
                                            data-v-c6a7496b=""
                                            class="has-text-weight-semibold foreground is-size-7"
                                            >Pre-Chorus (1)</span
                                        ><!--v-if--><!-- NOTE: For performance reasons, this icon is implemented inline, not using the BaseIcon SFC --><i
                                            data-v-c6a7496b=""
                                            class="icon mdi ml-2 mr-2 foreground"
                                            ><svg
                                                data-v-c6a7496b=""
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    data-v-c6a7496b=""
                                                    fill="currentColor"
                                                    d=""
                                                ></path></svg></i
                                        ><!-- second line, if not minified (use a horizontal level also on mobile)--><!--v-if--></span
                                    ></button
                                ><button
                                    data-v-c6a7496b=""
                                    class="button cue has-text-left is-flex-grow-1 has-cropped-text is-warning"
                                    title="Play from Chorus (1) A/T"
                                    data-cy="cue-button"
                                    id="f6177347-04cb-4a75-8ab3-8eb3eb11b791"
                                >
                                    <!-- Use the full width of the button for the inside content
        This causes the icon and description to start from the left side, 
        representing the begin of the cue, which suits the intention --><!-- Do not handle click events here; they should originate from the outer button --><span
                                        data-v-c6a7496b=""
                                        class="player-timeline is-fullwidth"
                                        style="pointer-events: none"
                                        ><!-- Progress --><span
                                            data-v-c6a7496b=""
                                            class="player-progress has-addons-right player-progress-none"
                                        ></span
                                        ><!-- First line (Do not use a level here, this has only complicated things for smaller widths so far)--><!-- NOTE: For performance reasons, this icon is implemented inline, not using the BaseIcon SFC --><i
                                            data-v-c6a7496b=""
                                            class="icon mdi foreground"
                                            ><svg
                                                data-v-c6a7496b=""
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    data-v-c6a7496b=""
                                                    fill="currentColor"
                                                    d="M8,5.14V19.14L19,12.14L8,5.14Z"
                                                ></path></svg></i
                                        ><!-- Text depending on variant --><span
                                            data-v-c6a7496b=""
                                            class="has-text-weight-semibold foreground is-size-7"
                                            >Chorus (1) A/T</span
                                        ><!--v-if--><!-- NOTE: For performance reasons, this icon is implemented inline, not using the BaseIcon SFC --><i
                                            data-v-c6a7496b=""
                                            class="icon mdi ml-2 mr-2 foreground"
                                            ><svg
                                                data-v-c6a7496b=""
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    data-v-c6a7496b=""
                                                    fill="currentColor"
                                                    d=""
                                                ></path></svg></i
                                        ><!-- second line, if not minified (use a horizontal level also on mobile)--><!--v-if--></span
                                    ></button
                                ><button
                                    data-v-c6a7496b=""
                                    class="button cue has-text-left is-flex-grow-1 has-cropped-text is-warning"
                                    title="Play from Vers 3 (1) Solo"
                                    data-cy="cue-button"
                                    id="2f57b55d-979a-4eb8-9ca8-46b8c66bc1b2"
                                >
                                    <!-- Use the full width of the button for the inside content
        This causes the icon and description to start from the left side, 
        representing the begin of the cue, which suits the intention --><!-- Do not handle click events here; they should originate from the outer button --><span
                                        data-v-c6a7496b=""
                                        class="player-timeline is-fullwidth"
                                        style="pointer-events: none"
                                        ><!-- Progress --><span
                                            data-v-c6a7496b=""
                                            class="player-progress has-addons-right player-progress-none"
                                        ></span
                                        ><!-- First line (Do not use a level here, this has only complicated things for smaller widths so far)--><!-- NOTE: For performance reasons, this icon is implemented inline, not using the BaseIcon SFC --><i
                                            data-v-c6a7496b=""
                                            class="icon mdi foreground"
                                            ><svg
                                                data-v-c6a7496b=""
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    data-v-c6a7496b=""
                                                    fill="currentColor"
                                                    d="M8,5.14V19.14L19,12.14L8,5.14Z"
                                                ></path></svg></i
                                        ><!-- Text depending on variant --><span
                                            data-v-c6a7496b=""
                                            class="has-text-weight-semibold foreground is-size-7"
                                            >Vers 3 (1) Solo</span
                                        ><!--v-if--><!-- NOTE: For performance reasons, this icon is implemented inline, not using the BaseIcon SFC --><i
                                            data-v-c6a7496b=""
                                            class="icon mdi ml-2 mr-2 foreground"
                                            ><svg
                                                data-v-c6a7496b=""
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    data-v-c6a7496b=""
                                                    fill="currentColor"
                                                    d=""
                                                ></path></svg></i
                                        ><!-- second line, if not minified (use a horizontal level also on mobile)--><!--v-if--></span
                                    ></button
                                ><button
                                    data-v-c6a7496b=""
                                    class="button cue has-text-left is-flex-grow-1 has-cropped-text is-warning"
                                    title="Play from Vers 3 (2) Solo+Chor"
                                    data-cy="cue-button"
                                    id="29c0ea81-beb3-4246-aaee-69b9d317b472"
                                >
                                    <!-- Use the full width of the button for the inside content
        This causes the icon and description to start from the left side, 
        representing the begin of the cue, which suits the intention --><!-- Do not handle click events here; they should originate from the outer button --><span
                                        data-v-c6a7496b=""
                                        class="player-timeline is-fullwidth"
                                        style="pointer-events: none"
                                        ><!-- Progress --><span
                                            data-v-c6a7496b=""
                                            class="player-progress has-addons-right player-progress-none"
                                        ></span
                                        ><!-- First line (Do not use a level here, this has only complicated things for smaller widths so far)--><!-- NOTE: For performance reasons, this icon is implemented inline, not using the BaseIcon SFC --><i
                                            data-v-c6a7496b=""
                                            class="icon mdi foreground"
                                            ><svg
                                                data-v-c6a7496b=""
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    data-v-c6a7496b=""
                                                    fill="currentColor"
                                                    d="M8,5.14V19.14L19,12.14L8,5.14Z"
                                                ></path></svg></i
                                        ><!-- Text depending on variant --><span
                                            data-v-c6a7496b=""
                                            class="has-text-weight-semibold foreground is-size-7"
                                            >Vers 3 (2) Solo+Chor</span
                                        ><!--v-if--><!-- NOTE: For performance reasons, this icon is implemented inline, not using the BaseIcon SFC --><i
                                            data-v-c6a7496b=""
                                            class="icon mdi ml-2 mr-2 foreground"
                                            ><svg
                                                data-v-c6a7496b=""
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    data-v-c6a7496b=""
                                                    fill="currentColor"
                                                    d=""
                                                ></path></svg></i
                                        ><!-- second line, if not minified (use a horizontal level also on mobile)--><!--v-if--></span
                                    ></button
                                ><button
                                    data-v-c6a7496b=""
                                    class="button cue has-text-left is-flex-grow-1 has-cropped-text is-warning"
                                    title="Play from Pre-Chorus (2)"
                                    data-cy="cue-button"
                                    id="8bcda48a-6f66-42ff-ba7f-63bdb5883df4"
                                >
                                    <!-- Use the full width of the button for the inside content
        This causes the icon and description to start from the left side, 
        representing the begin of the cue, which suits the intention --><!-- Do not handle click events here; they should originate from the outer button --><span
                                        data-v-c6a7496b=""
                                        class="player-timeline is-fullwidth"
                                        style="pointer-events: none"
                                        ><!-- Progress --><span
                                            data-v-c6a7496b=""
                                            class="player-progress has-addons-right player-progress-none"
                                        ></span
                                        ><!-- First line (Do not use a level here, this has only complicated things for smaller widths so far)--><!-- NOTE: For performance reasons, this icon is implemented inline, not using the BaseIcon SFC --><i
                                            data-v-c6a7496b=""
                                            class="icon mdi foreground"
                                            ><svg
                                                data-v-c6a7496b=""
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    data-v-c6a7496b=""
                                                    fill="currentColor"
                                                    d="M8,5.14V19.14L19,12.14L8,5.14Z"
                                                ></path></svg></i
                                        ><!-- Text depending on variant --><span
                                            data-v-c6a7496b=""
                                            class="has-text-weight-semibold foreground is-size-7"
                                            >Pre-Chorus (2)</span
                                        ><!--v-if--><!-- NOTE: For performance reasons, this icon is implemented inline, not using the BaseIcon SFC --><i
                                            data-v-c6a7496b=""
                                            class="icon mdi ml-2 mr-2 foreground"
                                            ><svg
                                                data-v-c6a7496b=""
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    data-v-c6a7496b=""
                                                    fill="currentColor"
                                                    d=""
                                                ></path></svg></i
                                        ><!-- second line, if not minified (use a horizontal level also on mobile)--><!--v-if--></span
                                    ></button
                                ><button
                                    data-v-c6a7496b=""
                                    class="button cue has-text-left is-flex-grow-1 has-cropped-text is-warning"
                                    title="Play from Chorus (2) A/T"
                                    data-cy="cue-button"
                                    id="54507200-e42b-4be5-939a-e3fb3b586a4c"
                                >
                                    <!-- Use the full width of the button for the inside content
        This causes the icon and description to start from the left side, 
        representing the begin of the cue, which suits the intention --><!-- Do not handle click events here; they should originate from the outer button --><span
                                        data-v-c6a7496b=""
                                        class="player-timeline is-fullwidth"
                                        style="pointer-events: none"
                                        ><!-- Progress --><span
                                            data-v-c6a7496b=""
                                            class="player-progress has-addons-right player-progress-none"
                                        ></span
                                        ><!-- First line (Do not use a level here, this has only complicated things for smaller widths so far)--><!-- NOTE: For performance reasons, this icon is implemented inline, not using the BaseIcon SFC --><i
                                            data-v-c6a7496b=""
                                            class="icon mdi foreground"
                                            ><svg
                                                data-v-c6a7496b=""
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    data-v-c6a7496b=""
                                                    fill="currentColor"
                                                    d="M8,5.14V19.14L19,12.14L8,5.14Z"
                                                ></path></svg></i
                                        ><!-- Text depending on variant --><span
                                            data-v-c6a7496b=""
                                            class="has-text-weight-semibold foreground is-size-7"
                                            >Chorus (2) A/T</span
                                        ><!--v-if--><!-- NOTE: For performance reasons, this icon is implemented inline, not using the BaseIcon SFC --><i
                                            data-v-c6a7496b=""
                                            class="icon mdi ml-2 mr-2 foreground"
                                            ><svg
                                                data-v-c6a7496b=""
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    data-v-c6a7496b=""
                                                    fill="currentColor"
                                                    d=""
                                                ></path></svg></i
                                        ><!-- second line, if not minified (use a horizontal level also on mobile)--><!--v-if--></span
                                    ></button
                                ><button
                                    data-v-c6a7496b=""
                                    class="button cue has-text-left is-flex-grow-1 has-cropped-text is-warning"
                                    title="Play from Coda (1) A/T"
                                    data-cy="cue-button"
                                    id="e4150703-581b-4cf5-9e72-6bfa7056f329"
                                >
                                    <!-- Use the full width of the button for the inside content
        This causes the icon and description to start from the left side, 
        representing the begin of the cue, which suits the intention --><!-- Do not handle click events here; they should originate from the outer button --><span
                                        data-v-c6a7496b=""
                                        class="player-timeline is-fullwidth"
                                        style="pointer-events: none"
                                        ><!-- Progress --><span
                                            data-v-c6a7496b=""
                                            class="player-progress has-addons-right player-progress-none"
                                        ></span
                                        ><!-- First line (Do not use a level here, this has only complicated things for smaller widths so far)--><!-- NOTE: For performance reasons, this icon is implemented inline, not using the BaseIcon SFC --><i
                                            data-v-c6a7496b=""
                                            class="icon mdi foreground"
                                            ><svg
                                                data-v-c6a7496b=""
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    data-v-c6a7496b=""
                                                    fill="currentColor"
                                                    d="M8,5.14V19.14L19,12.14L8,5.14Z"
                                                ></path></svg></i
                                        ><!-- Text depending on variant --><span
                                            data-v-c6a7496b=""
                                            class="has-text-weight-semibold foreground is-size-7"
                                            >Coda (1) A/T</span
                                        ><!--v-if--><!-- NOTE: For performance reasons, this icon is implemented inline, not using the BaseIcon SFC --><i
                                            data-v-c6a7496b=""
                                            class="icon mdi ml-2 mr-2 foreground"
                                            ><svg
                                                data-v-c6a7496b=""
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    data-v-c6a7496b=""
                                                    fill="currentColor"
                                                    d=""
                                                ></path></svg></i
                                        ><!-- second line, if not minified (use a horizontal level also on mobile)--><!--v-if--></span
                                    ></button
                                ><button
                                    data-v-c6a7496b=""
                                    class="button cue has-text-left is-flex-grow-1 has-cropped-text is-warning"
                                    title="Play from Coda (2) A/T"
                                    data-cy="cue-button"
                                    id="028e3aa1-61cf-4497-a8a5-a7e7c6225623"
                                >
                                    <!-- Use the full width of the button for the inside content
        This causes the icon and description to start from the left side, 
        representing the begin of the cue, which suits the intention --><!-- Do not handle click events here; they should originate from the outer button --><span
                                        data-v-c6a7496b=""
                                        class="player-timeline is-fullwidth"
                                        style="pointer-events: none"
                                        ><!-- Progress --><span
                                            data-v-c6a7496b=""
                                            class="player-progress has-addons-right player-progress-none"
                                        ></span
                                        ><!-- First line (Do not use a level here, this has only complicated things for smaller widths so far)--><!-- NOTE: For performance reasons, this icon is implemented inline, not using the BaseIcon SFC --><i
                                            data-v-c6a7496b=""
                                            class="icon mdi foreground"
                                            ><svg
                                                data-v-c6a7496b=""
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    data-v-c6a7496b=""
                                                    fill="currentColor"
                                                    d="M8,5.14V19.14L19,12.14L8,5.14Z"
                                                ></path></svg></i
                                        ><!-- Text depending on variant --><span
                                            data-v-c6a7496b=""
                                            class="has-text-weight-semibold foreground is-size-7"
                                            >Coda (2) A/T</span
                                        ><!--v-if--><!-- NOTE: For performance reasons, this icon is implemented inline, not using the BaseIcon SFC --><i
                                            data-v-c6a7496b=""
                                            class="icon mdi ml-2 mr-2 foreground"
                                            ><svg
                                                data-v-c6a7496b=""
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    data-v-c6a7496b=""
                                                    fill="currentColor"
                                                    d=""
                                                ></path></svg></i
                                        ><!-- second line, if not minified (use a horizontal level also on mobile)--><!--v-if--></span
                                    >
                                </button>
                            </div>
                        </div>
                    </div>
                    <!-- The media viewport --><!-- Hide the waveform and Video for non-expanded track during edit, save screen real estate --><!-- //TODO make a proper distance, (using block?), but only if there is content to display -->
                    <div data-v-9b701c96="" class="block">
                        <!-- //TODO currently the mediaUrl is not using the optimized
                variant, because otherwise the track is not correctly loaded
                after it has become the active track ( gets
                play-request-was-interrupted) --><!--v-if--><!-- use the audio element --><audio
                            data-v-497415ac=""
                            id="media-track-d70eeaab-0731-4a46-bac9-42eb7faa2238"
                            preload="metadata"
                            src="blob:http://localhost:5173/e094cf08-4fbe-4462-8205-dc5c49fe6e34"
                            class="video is-small paused"
                            title="Click to play/pause"
                            style="
                                --497415ac-fadeInDuration: 0s;
                                --497415ac-fadeOutDuration: 0s;
                            "
                        ></audio
                        ><!-- NOTE: the rendering of the AudioLevelMeter _might_ affect badly the 
         synchronous start of the multitrack playback, 
         but only the first time after a page reload/player instantiation.
         It's currently not consistently reproducible and goes away after a 
         subsequent sync (e.g. after pause/play) --><!-- NOTE: Teleportation of the AudioLevelMeter fails with a warning when 
         the parent track component has not yet been mounted.
         This situation is addressed with the isParentMounted flag. It's 
         working for loading/unloading/reloading compilation and
         adding new tracks.
         Disabling the teleportation does not work currently: When the 
         application settings change to show the meter, produces a warning. 
         The solution for this is using a v-if instead of disableing. --><!--v-if--><!--v-if--><!--v-if-->
                    </div>
                </div>
            </div>
            <!--teleport end-->
        </div>
    </div>
</template>

<script setup lang="ts">
import PlayPauseButton from '@/components/buttons/PlayPauseButton.vue';
import { useMultitrackStore } from '@/store/multitrack';
import { storeToRefs } from 'pinia';
import { isPlayingInjectionKey } from './TrackInjectionKeys';
import { provide, readonly } from 'vue';

/** Displays a master track div with a title, and controls for it.
 * @displayName MasterTrack
 */

// --- Multitrack ---
const multitrack = useMultitrackStore();
const {
    isAllTrackLoaded,
    isAllTrackMuted,
    isAllTrackSoloed,
    isAllPlaying,
    isAllPaused,
    isAllMediaAvailable,
    isAnyFading,
} = storeToRefs(multitrack);

provide(isPlayingInjectionKey, readonly(isAllPlaying));
</script>
