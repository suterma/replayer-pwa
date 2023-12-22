import { describe, it, expect } from 'vitest';
//TODO using the track API breaks tests by throwing an error
// ReferenceError: AudioNode is not defined
// when build for testing with vitest
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

    it('should parse an undefined track when the query is empty', () => {
        //Arrange
        const query = {} as LocationQuery;

        //Act
        const track = TrackApi.parseFromUrlQuery(query);

        //Assert
        expect(track).toBeUndefined();
    });

    it('should parse a full query to a complete track', () => {
        //Arrange

        const query = {
            media: 'https://web.replayer.app/music/your-light-by-lidija-roos.mp3',
            title: 'Your Light',
            artist: 'Lidija Roos',
            album: 'Not For Sale',
            '6.49': 'Intro',
        } as LocationQuery;

        console.debug('jest', query);

        //Act
        const track = TrackApi.parseFromUrlQuery(query);

        //Assert
        expect(track).toBeDefined();
        expect(track?.Url).toBe(
            'https://web.replayer.app/music/your-light-by-lidija-roos.mp3',
        );
        expect(track?.Name).toBe('Your Light');
        expect(track?.Artist).toBe('Lidija Roos');
        expect(track?.Album).toBe('Not For Sale');
        expect(track?.Duration).toBeNull(); //"Because a duration is only available after track loading in the player."
        expect(track?.Cues).toBeDefined();
        expect(track?.Cues).toHaveLength(1);
        expect(track?.Cues[0]?.Description).toBe('Intro');
        expect(track?.Cues[0]?.Time).toBe(6.49);
        expect(track?.Cues[0]?.Id).toBeDefined();
        expect(track?.Cues[0]?.Duration).toBeNull(); //"Because a duration is only available after track loading in the player."
        expect(track?.Cues[0]?.Shortcut).toBeNull(); //because there is none
    });

    it('should parse multliple cues into a list', () => {
        //Arrange

        const query = {
            media: 'https://web.replayer.app/music/your-light-by-lidija-roos.mp3',
            6.49: 'Intro',
            12.1: 'Intro2',
        } as LocationQuery;

        //Act
        const track = TrackApi.parseFromUrlQuery(query);

        //Assert
        expect(track).toBeDefined();
        expect(track?.Cues).toBeDefined();
        expect(track?.Cues).toHaveLength(2);
        expect(track?.Cues[0]?.Description).toBe('Intro');
        expect(track?.Cues[0]?.Time).toBe(6.49);
        expect(track?.Cues[0]?.Id).toBeDefined();
        expect(track?.Cues[0]?.Duration).toBeNull(); //"Because a duration is only available after track loading in the player."
        expect(track?.Cues[0]?.Shortcut).toBeNull(); //because there is none
        expect(track?.Cues[1]?.Description).toBe('Intro2');
        expect(track?.Cues[1]?.Time).toBe(12.1);
        expect(track?.Cues[1]?.Id).toBeDefined();
        expect(track?.Cues[1]?.Duration).toBeNull(); //"Because a duration is only available after track loading in the player."
        expect(track?.Cues[1]?.Shortcut).toBeNull(); //because there is none
    });

    it('should parse a single cue with time 0 correctly', () => {
        //Arrange

        const query = {
            media: 'https://web.replayer.app/music/your-light-by-lidija-roos.mp3',
            0: 'Zero',
        } as LocationQuery;

        //Act
        const track = TrackApi.parseFromUrlQuery(query);

        //Assert
        expect(track).toBeDefined();
        expect(track?.Cues).toBeDefined();
        expect(track?.Cues).toHaveLength(1);
        expect(track?.Cues[0]?.Time).toBe(0);
        expect(track?.Cues[0]?.Description).toBe('Zero');
    });

    it('should parse multiple cues with an integer time correctly', () => {
        //Arrange

        const query = {
            media: 'https://web.replayer.app/music/your-light-by-lidija-roos.mp3',
            12: 'Twelve',
            13: 'Thirteen',
        } as LocationQuery;

        //Act
        const track = TrackApi.parseFromUrlQuery(query);

        //Assert
        expect(track?.Cues[0]?.Time).toBe(12);
        expect(track?.Cues[0]?.Description).toBe('Twelve');
        expect(track?.Cues[1]?.Time).toBe(13);
        expect(track?.Cues[1]?.Description).toBe('Thirteen');
    });

    it('should parse the initial playheadPosition correctly', () => {
        //Arrange

        const query = {
            media: 'https://web.replayer.app/music/your-light-by-lidija-roos.mp3',
            t: '12.7',
        } as LocationQuery;

        //Act
        const track = TrackApi.parseFromUrlQuery(query);

        //Assert
        expect(track?.PlayheadPosition).toBe(12.7);
    });

    it('should produce the playheadPosition for a track', async () => {
        //Arrange
        const testTrack = new Track(
            'testTrackName',
            'testAlbum',
            'testArtist',
            5 /*pre-roll*/,
            24.78 /*playheadPosition*/,
            null /*meter*/,
            false /*useMeasureNumbers*/,
            'https://example.com/test.mp3',
            'track-deadbeef',
            new Array<Cue>(),
            60,
            1,
        );

        //Act
        const actualUrl = TrackApi.Url(testTrack);

        //Assert
        expect(actualUrl).toContain('&t=24.78');
    });
});
