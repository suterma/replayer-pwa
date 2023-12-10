import { expect, describe, it } from 'vitest';
import { Compilation } from '@/store/Compilation';
import { PlaybackMode } from '@/store/PlaybackMode';
import { type ITrack } from '@/store/ITrack';
import { XmlCompilation } from './XmlCompilation';

describe('the XML mapping', function () {
    it('should return an initialised XmlCompilation object', function () {
        // Arrange
        const compilation = new Compilation(
            'c:\\temp',
            'testTitle',
            'testArtist',
            'testAlbum',
            'https://test.example.com/music',
            'compilationId',
            new Array<ITrack>(),
        );

        //Act
        const target = new XmlCompilation(compilation);

        //Assert
        expect(target.Id).toBe(compilation.Id);
        expect(target.MediaPath).toBe(compilation.MediaPath);
        expect(target.Title).toBe(compilation.Title);
        expect(target.Artist).toBe(compilation.Artist);
        expect(target.Album).toBe(compilation.Album);
        expect(target.Tracks.Track).toHaveLength(0);
    });
});
