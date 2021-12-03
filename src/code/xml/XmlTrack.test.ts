import { ICue, Track } from '@/store/compilation-types';
import { XmlTrack } from './XmlTrack';

describe('the XML mapping', function () {
    it('should return an initialised XmlTrack object', function () {
        // Arrange
        const track = new Track(
            'testName',
            'testAlbum',
            'testArtist',
            88.8,
            'https://test.example.com?myfile.mp3',
            'testId',
            new Array<ICue>(),
        );

        //Act
        const target = new XmlTrack(track);

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
