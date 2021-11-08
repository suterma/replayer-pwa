import { Cue, Track } from '@/store/compilation-types';
import { XmlTrack } from './XmlTrack';

describe('the XML mapping', function () {
    it('should return an initialised XmlTrack object', function () {
        // Arrange
        var track = new Track();
        track.Album = 'testAlbum';
        track.Artist = 'testArtist';
        track.Cues = new Array<Cue>();
        track.Id = 'testId';
        track.Measure = 88.8;
        track.Name = 'testName';
        track.Url = 'https://test.example.com?myfile.mp3';

        //Act
        let target = new XmlTrack(track);

        //Assert
        expect(target.Album).toBe(track.Album);
        expect(target.Artist).toBe(track.Artist);
        expect(target.Cues.Cue).toHaveLength(0);
        expect(target.Id).toBe(track.Id);
        expect(target.Measure).toBe(track.Measure);
        expect(target.Name).toBe(track.Name);
        expect(target.Url).toBe(track.Url);
    });
});
