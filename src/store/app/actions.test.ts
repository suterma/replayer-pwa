/**
 * @licstart The following is the entire license notice for the
 * JavaScript code in this page
 *
 * Copyright (c) 2024 Marcel Suter - Replayer
 *
 * This source code is licensed under the AGPL license found in the
 * LICENSE file in the root of this projects source tree.
 *
 * @licend The above is the entire license notice for the
 * JavaScript code in this page
 */

import { expect, describe, it, beforeEach, afterEach } from 'vitest';
import { MediaBlob } from '../types';
import { getters } from './getters';
import { Track } from '../Track';
import type { ITrack } from '../ITrack';
import type { ICue } from '../ICue';
import { useAppStore } from '.';
import { createPinia } from 'pinia';

describe('actions.ts', () => {
    let mediaBlobs = new Array<MediaBlob>();

    const pinia = createPinia();
    const app = useAppStore(pinia);

    beforeEach(() => {
        const dataBase64 = 'VEhJUyBJUyBUSEUgQU5TV0VSCg==';
        const arrayBuffer = Uint8Array.from(window.atob(dataBase64), (c) =>
            c.charCodeAt(0),
        );
        const firstBlob = new Blob([arrayBuffer], {
            type: 'application/pdf',
        });

        mediaBlobs.push(new MediaBlob('first.name', firstBlob));
        mediaBlobs.push(new MediaBlob('second.name', firstBlob));
        mediaBlobs.push(new MediaBlob('third.name', firstBlob));
    });

    afterEach(() => {
        mediaBlobs = new Array<MediaBlob>();
    });

    function getTestTrack(): ITrack {
        return new Track(
            'testName',
            'testAlbum',
            'testArtist',
            2.2 /*pre-roll*/,
            15.1 /*initialPlayheadPosition*/,
            0.75,
            null,
            null,
            'testUrl',
            'testId',
            new Array<ICue>(),
            new Set<string>(['testTag']),
            null,
            1,
            null,
        );
    }

    it('should clone a media track', async () => {
        //Arrange
        const testTrack = getTestTrack();
        app.addTrack(testTrack);

        //Act
        app.cloneTrack(testTrack.Id);

        //Assert
        const actualTracks = getters.allTracks.value;
        expect(actualTracks).toHaveLength(2);
    });

    it('should clone a media track with all the tags cloned too', async () => {
        //Arrange
        const testTrack = getTestTrack();
        app.addTrack(testTrack);

        //Act
        app.cloneTrack(testTrack.Id);

        //Assert
        const actualTracks = getters.allTracks.value;
        const clonedTrack = actualTracks[1];
        expect(clonedTrack.Tags).toHaveLength(1);
        const iterator = clonedTrack.Tags.values();
        expect(iterator.next().value).toBe('testTag');
    });

    it('should clone a media track with an updated name', async () => {
        //Arrange
        const testTrack = getTestTrack();
        app.addTrack(testTrack);

        //Act
        app.cloneTrack(testTrack.Id);

        //Assert
        const actualTracks = getters.allTracks.value;
        const clonedTrack = actualTracks[1];
        expect(clonedTrack.Name).toContain('(cloned)');
    });
});
