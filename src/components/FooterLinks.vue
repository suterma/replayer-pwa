<template>
    <router-link to="/demo" data-cy="demo-link">Demo</router-link>
    <span class="mx-2"></span>

    <a
        href="https://replayer.app#how-it-works"
        alt="Link to the Replayer app website with the how it works section"
        target="_blank"
        >How it works</a
    >
    <span class="mx-2"></span>
    <a
        href="https://replayer.app/documentation/media-formats"
        alt="Link to the Replayer app documentation about media formats"
        target="_blank"
        >Supported media formats</a
    >
    <span class="mx-2 is-hidden-mobile"></span>

    <a
        class="is-hidden-mobile"
        href="https://replayer.app/en/documentation/keyboard-shortcuts"
        alt="Link to the Replayer app keyboard shortcuts"
        target="_blank"
        >Keyboard shortcuts</a
    >
    <span class="mx-2"></span>
    <a
        href="https://replayer.app/privacy-policy"
        alt="Link to the Replayer app privacy policy"
        target="_blank"
        >Privacy policy</a
    >
    <span class="mx-2"></span> <slot></slot>
</template>
