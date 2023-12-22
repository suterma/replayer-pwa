import { describe, it, expect } from 'vitest';
import { TrackApi } from './TrackApi';
import { Track } from '@/store/Track';
import { Cue } from '@/store/Cue';
import type { LocationQuery } from 'vue-router';

describe('TrackApi.ts', () => {
    it('should produce an URL for a simple track', async () => {
        //Arrange
        const testCues = new Array<Cue>();
        testCues[0] = new Cue(
            'testCueDescription',
            '1',
            45,
            15,
            'cue-deadbeef',
        );
        const testTrack = new Track(
            'testTrackName',
            'testAlbum',
            'testArtist',
            5 /*pre-roll*/,
            null /*playheadPosition*/,
            null /*meter*/,
            false /*useMeasureNumbers*/,
            'https://example.com/test.mp3',
            'track-deadbeef',
            testCues,
            60,
            1,
        );

        //Act
        const actualUrl = TrackApi.Url(testTrack);

        //Assert
        expect(actualUrl).toContain(
            '/#/play?45=testCueDescription&media=https://example.com/test.mp3&title=testTrackName&album=testAlbum&artist=testArtist',
        );
    });

    it('should parse the track from a simple URL', async () => {
        //Arrange
        const query: LocationQuery = {
            media: 'https://example.com/test.mp3',
            title: 'testTrackName',
            artist: 'testArtist',
            album: 'testAlbum',
            45: 'testCueDescription',
        };

        //Act
        const actualTrack = TrackApi.parseFromUrlQuery(query);

        //Assert
        expect(actualTrack?.Url).toBe('https://example.com/test.mp3');
        expect(actualTrack?.Name).toBe('testTrackName');
        expect(actualTrack?.Artist).toBe('testArtist');
        expect(actualTrack?.Album).toBe('testAlbum');
        expect(actualTrack?.Cues).toHaveLength(1);
        const actualCue = actualTrack?.Cues[0];
        expect(actualCue?.Description).toBe('testCueDescription');
        expect(actualCue?.Id).toBeDefined(); // because a id should have been assigned
        expect(actualCue?.Duration).toBeNull(); // because duration is unknown at parsing time
        expect(actualCue?.Shortcut).toBeNull(); // because shortcuts are not parsed
        expect(actualCue?.Time).toBe(45);
    });
});
