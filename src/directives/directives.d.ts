import type { Directive } from 'vue';

declare module 'vue' {
    export interface GlobalDirectives {
        vFocus: Directive<HTMLElement, boolean>;
        vScroll: Directive<HTMLElement, boolean, 'top' | 'visible'>;
        vExperiment: Directive<HTMLElement, boolean>;
        vTooltip: Directive<
            HTMLElement,
            string,
            'top' | 'right' | 'bottom' | 'left' | 'hover'
        >;
    }
}

export {};
