import { Compilation, CompilationType, Track } from '@/store/compilation-types';
import { XmlCompilation } from './XmlCompilation';

describe('the XML mapping', function () {
    it('should return an initialised XmlCompilation object', function () {
        // Arrange
        const compilation = new Compilation();
        compilation.Id = 'compilationId';
        compilation.MediaPath = 'c:\\temp';
        compilation.Title = 'testTitle';
        compilation.Tracks = new Array<Track>();
        compilation.Type = CompilationType.XML;
        compilation.Url = 'https://test.example.com/music';

        //Act
        const target = new XmlCompilation(compilation);

        //Assert
        expect(target.Id).toBe(compilation.Id);
        expect(target.MediaPath).toBe(compilation.MediaPath);
        expect(target.Title).toBe(compilation.Title);
        expect(target.Tracks.Track).toHaveLength(0);
    });
});
