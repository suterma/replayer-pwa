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

import { describe, it, expect } from 'vitest'; // import { type ICue, Track } from '@/store/compilation-types';
import { XmlTrack } from './XmlTrack';
import { TimeSignature } from '../music/TimeSignature';
import { Meter } from '../music/Meter';
import { Track } from '@/store/Track';
import { type ICue } from '@/store/ICue';

describe('the XML mapping', function () {
    it('should return an initialized XmlTrack object', function () {
        // Arrange
        const track = new Track(
            'testName',
            'testAlbum',
            'testArtist',
            9,
            15 /* initialPlayheadPosition */,
            0.75 /* playbackRate */,
            new Meter(new TimeSignature(3, 4), 90, 0.1),
            false,
            'https://test.example.com?myfile.mp3',
            'testId',
            new Array<ICue>(),
            new Set<string>(['default-tag']),
            60,
            0.9,
            null,
        );

        //Act
        const target = new XmlTrack(track);

        //Assert
        expect(target.Album).toBe(track.Album);
        expect(target.Artist).toBe(track.Artist);
        expect(target.PreRoll).toBe(track.PreRoll);
        expect(target.PlayheadPosition).toBe(track.PlayheadPosition);
        expect(target.PlaybackRate).toBe(track.PlaybackRate);
        expect(target.Cues.Cue).toHaveLength(0);
        expect(target.Tags).toHaveLength(0);
        expect(target.Id).toBe(track.Id);
        expect(target.Meter?.BeatsPerMinute).toBe(track.Meter?.BeatsPerMinute);
        expect(target.Meter?.TimeSignature).toBe(track.Meter?.TimeSignature);
        expect(target.Meter?.OriginTime).toBe(track.Meter?.OriginTime);
        expect(target.UseMeasureNumbers).toBe(track.UseMeasureNumbers);
        expect(target.Name).toBe(track.Name);
        expect(target.Url).toBe(track.Url);
        expect(target.Volume).toBe(track.Volume);
        //HINT: Duration is not serialized
    });
});
