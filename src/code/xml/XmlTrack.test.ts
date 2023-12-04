import {
    describe,
    it,
    beforeEach,
    afterEach,
    expect,
    vi,
    type MockInstance,
} from 'vitest'; // import { type ICue, Track } from '@/store/compilation-types';
import { XmlTrack } from './XmlTrack';
import { TimeSignature } from '../music/TimeSignature';
import { Meter } from '../music/Meter';
import { Track, type ICue } from '@/store/compilation-types';

describe('the XML mapping', function () {
    it('should return an initialized XmlTrack object', function () {
        // Arrange
        const track = new Track(
            'testName',
            'testAlbum',
            'testArtist',
            0,
            new Meter(new TimeSignature(3, 4), 90, 0.1),
            false,
            'https://test.example.com?myfile.mp3',
            'testId',
            new Array<ICue>(),
            60,
            0.9,
        );

        //Act
        const target = new XmlTrack(track);

        //Assert
        expect(target.Album).toBe(track.Album);
        expect(target.Artist).toBe(track.Artist);
        expect(target.Cues.Cue).toHaveLength(0);
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
