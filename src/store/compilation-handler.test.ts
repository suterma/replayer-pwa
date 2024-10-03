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
import { MediaBlob } from './types';
import CompilationHandler from './compilation-handler';
import { Compilation } from './Compilation';
import { DefaultPitchShift, DefaultPlaybackRate, Track } from './Track';
import type { ITrack } from './ITrack';
import type { ICue } from './ICue';

describe('CompilationHandler.ts', () => {
    let mediaBlobs = new Array<MediaBlob>();

    /** Gets a new default test track for testing purposes */
    function getTestTrack(): ITrack {
        return new Track(
            'testName',
            'testAlbum',
            'testArtist',
            2.2 /*pre-roll*/,
            15.1 /*initialPlayheadPosition*/,
            DefaultPlaybackRate,
            DefaultPitchShift,
            null,
            null,
            'testUrl',
            'testId',
            new Array<ICue>(),
            new Set<string>(['default-tag']),
            null,
            1,
        );
    }

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

    it('should not sort the blobs when no matching name is given', async () => {
        //Arrange

        //Act
        const sortedMediaBlobs = CompilationHandler.sortByFirstFileName(
            mediaBlobs,
            'anyname',
        );

        //Assert
        //The order should be unchanged
        expect(sortedMediaBlobs[0]?.fileName).toBe('first.name');
        expect(sortedMediaBlobs[1]?.fileName).toBe('second.name');
        expect(sortedMediaBlobs[2]?.fileName).toBe('third.name');
    });

    it('should not sort the blobs when no name is given', async () => {
        //Arrange

        //Act
        const sortedMediaBlobs = CompilationHandler.sortByFirstFileName(
            mediaBlobs,
            undefined,
        );

        //Assert
        //The order should be unchanged
        expect(sortedMediaBlobs[0]?.fileName).toBe('first.name');
        expect(sortedMediaBlobs[1]?.fileName).toBe('second.name');
        expect(sortedMediaBlobs[2]?.fileName).toBe('third.name');
    });

    it('should sort the blobs in order for the given track name', async () => {
        //Arrange

        //Act
        const sortedMediaBlobs = CompilationHandler.sortByFirstFileName(
            mediaBlobs,
            'third.name',
        );

        //Assert
        expect(sortedMediaBlobs[0]?.fileName).toBe('third.name');
    });

    it('should sort the blobs in order for the given second track name', async () => {
        //Arrange

        //Act
        const sortedMediaBlobs = CompilationHandler.sortByFirstFileName(
            mediaBlobs,
            'second.name',
        );

        //Assert
        expect(sortedMediaBlobs[0]?.fileName).toBe('second.name');
    });

    it('should sort the blobs in order for the given ending track name', async () => {
        //Arrange

        //Act
        const sortedMediaBlobs = CompilationHandler.sortByFirstFileName(
            mediaBlobs,
            'ird.name',
        );

        //Assert
        expect(sortedMediaBlobs[0]?.fileName).toBe('third.name');
    });

    it('should sort the blobs in order for the given distorted track name', async () => {
        //Arrange

        //Act
        const sortedMediaBlobs = CompilationHandler.sortByFirstFileName(
            mediaBlobs,
            '�third.name',
        );

        //Assert
        expect(sortedMediaBlobs[0]?.fileName).toBe('third.name');
    });

    it('should resolve mixed case for lazy conversion', async () => {
        //Arrange

        //Act
        const actual = CompilationHandler.getLazyFileName('SomeName');

        //Assert
        expect(actual).toEqual(CompilationHandler.getLazyFileName('somename'));
    });

    it('should resolve non-printable characters for lazy conversion', async () => {
        //Arrange

        //Act
        const actual = CompilationHandler.getLazyFileName('Some\rName');

        //Assert
        expect(actual).toEqual(CompilationHandler.getLazyFileName('SOMEname'));
    });

    it('should resolve other non-printable characters for lazy conversion', async () => {
        //Arrange

        //Act
        const actual = CompilationHandler.getLazyFileName(
            '01 OuvertБre_pb.mp3',
        );

        //Assert
        expect(actual).toEqual(
            CompilationHandler.getLazyFileName('01 Ouvertüre_pb.mp3'),
        );
    });

    it('should provide a proper file name for a fully annotated compilation', async () => {
        //Arrange
        const testCompilation = new Compilation(
            'c:\\file',
            'test-title',
            'test-artist',
            'test-album',
            'test-url',
            'test-id',
            [],
            new Set<string>([]),
        );

        //Act
        const actual =
            CompilationHandler.getCompilationFileName(testCompilation);

        //Assert
        expect(actual).toEqual('test-title-by-test-artist-on-test-album');
    });

    it('should provide a proper file name for a title-only compilation', async () => {
        //Arrange
        const testCompilation = new Compilation(
            'c:\\file',
            'test-title',
            ' ',
            ' ',
            'test-url',
            'test-id',
            [],
            new Set<string>([]),
        );

        //Act
        const actual =
            CompilationHandler.getCompilationFileName(testCompilation);

        //Assert
        expect(actual).toEqual('test-title');
    });

    it('should provide a proper file name for a title-only compilation with track', async () => {
        //Arrange
        const testCompilation = new Compilation(
            'c:\\file',
            'testCompilationTitle',
            ' ',
            ' ',
            'test-url',
            'test-id',
            [],
            new Set<string>([]),
        );
        testCompilation.Tracks.push(getTestTrack());

        //Act
        const actual =
            CompilationHandler.getCompilationFileName(testCompilation);

        //Assert
        expect(actual).toEqual('test-compilation-title');
    });

    it('should provide a proper file name for a title and artist compilation', async () => {
        //Arrange
        const testCompilation = new Compilation(
            'c:\\file',
            'test-title',
            'test-artist',
            ' ',
            'test-url',
            'test-id',
            [],
            new Set<string>([]),
        );

        //Act
        const actual =
            CompilationHandler.getCompilationFileName(testCompilation);

        //Assert
        expect(actual).toEqual('test-title-by-test-artist');
    });

    it('should provide a proper file name for a title and album compilation', async () => {
        //Arrange
        const testCompilation = new Compilation(
            'c:\\file',
            'test-title',
            ' ',
            'test-album ',
            'test-url',
            'test-id',
            [],
            new Set<string>([]),
        );

        //Act
        const actual =
            CompilationHandler.getCompilationFileName(testCompilation);

        //Assert
        expect(actual).toEqual('test-title-on-test-album');
    });

    it('should provide a proper file name with ugly input characters', async () => {
        //Arrange
        const testCompilation = new Compilation(
            'c:\\file',
            '"Don\'t Cry", Bass' /*title*/,
            '',
            '',
            '',
            '',
            [],
            new Set<string>([]),
        );

        //Act
        const actual =
            CompilationHandler.getCompilationFileName(testCompilation);

        //Assert
        expect(actual).toEqual('dont-cry-bass');
    });

    it('should provide a proper file name with german umlauts', async () => {
        //Arrange
        const testCompilation = new Compilation(
            'c:\\file',
            'Chömed, mier wänd go Chrieseli günne' /*title*/,
            '',
            '',
            '',
            '',
            [],
            new Set<string>([]),
        );

        //Act
        const actual =
            CompilationHandler.getCompilationFileName(testCompilation);

        //Assert
        expect(actual).toEqual('choemed-mier-waend-go-chrieseli-guenne');
    });

    it('should provide a proper file name for a track title only compilation', async () => {
        //Arrange
        const testCompilation = new Compilation(
            'c:\\file',
            '' /*title*/,
            '',
            '',
            'test-url',
            'test-id',
            [],
            new Set<string>([]),
        );

        const testTrack = getTestTrack();
        testTrack.Name = 'testTrackName';
        testTrack.Artist = '';
        testTrack.Album = '';
        testCompilation.Tracks.push(testTrack);

        //Act
        const actual =
            CompilationHandler.getCompilationFileName(testCompilation);

        //Assert
        expect(actual).toEqual('test-track-name');
    });

    it('should recognise an audio track', async () => {
        //Arrange
        const testTrack = getTestTrack();
        testTrack.Url = 'https://example.com/test.mp3';

        //Act
        const actualAudioTrack = CompilationHandler.isAudioTrack(testTrack);
        const actualVideoTrack = CompilationHandler.isVideoTrack(testTrack);
        const actualYouTubeTrack =
            CompilationHandler.isYoutubeVideoTrack(testTrack);

        //Assert
        expect(actualAudioTrack).toBeTruthy();
        expect(actualVideoTrack).toBeFalsy();
        expect(actualYouTubeTrack).toBeFalsy();
    });

    it('should recognise a video track', async () => {
        //Arrange
        const testTrack = getTestTrack();
        testTrack.Url = 'https://example.com/test.mp4';

        //Act
        const actualAudioTrack = CompilationHandler.isAudioTrack(testTrack);
        const actualVideoTrack = CompilationHandler.isVideoTrack(testTrack);
        const actualYouTubeTrack =
            CompilationHandler.isYoutubeVideoTrack(testTrack);

        //Assert
        expect(actualAudioTrack).toBeFalsy();
        expect(actualVideoTrack).toBeTruthy();
        expect(actualYouTubeTrack).toBeFalsy();
    });

    it('should recognise a YouTube track', async () => {
        //Arrange
        const testTrack = getTestTrack();
        testTrack.Url = 'https://www.youtube.com/watch?v=Oextk-If8HQ';

        //Act
        const actualAudioTrack = CompilationHandler.isAudioTrack(testTrack);
        const actualVideoTrack = CompilationHandler.isVideoTrack(testTrack);
        const actualYouTubeTrack =
            CompilationHandler.isYoutubeVideoTrack(testTrack);

        //Assert
        expect(actualAudioTrack).toBeFalsy();
        expect(actualVideoTrack).toBeFalsy();
        expect(actualYouTubeTrack).toBeTruthy();
    });

    it('should recognise an unspecified track as audio', async () => {
        //Arrange
        const testTrack = getTestTrack();
        testTrack.Url = 'https://www.somebox.example.com/mycustomfileid?dl=1';

        //Act
        const actualAudioTrack = CompilationHandler.isAudioTrack(testTrack);
        const actualVideoTrack = CompilationHandler.isVideoTrack(testTrack);
        const actualYouTubeTrack =
            CompilationHandler.isYoutubeVideoTrack(testTrack);

        //Assert
        expect(actualAudioTrack).toBeTruthy();
        expect(actualVideoTrack).toBeFalsy();
        expect(actualYouTubeTrack).toBeFalsy();
    });
});
