<template>
    <DropdownMenu
        title="Cue context menu"
        left
        down
        data-cy="context-menu-cue"
        :icon-path="mdiDotsHorizontal"
        :render-closed="false"
    >
        <div class="dropdown-item is-hidden-mobile">
            <p class="menu-label">Cue</p>
        </div>
        <slot></slot>
    </DropdownMenu>
</template>

<script setup lang="ts">
/** A menu for a cue
 */

import { mdiDotsHorizontal } from '@mdi/js';
import DropdownMenu from '@/components/dropdown-menu/DropdownMenu.vue';
</script>
