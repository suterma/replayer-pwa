import { Cue } from '@/store/compilation-types';
import { XmlCue } from './XmlCue';

describe('the XML mapping', function () {
    it('should return an initialised XmlCue object', function () {
        // Arrange
        var cue = new Cue();
        cue.Description = 'testDescription';
        cue.Duration = 99.9;
        cue.Id = 'myId';
        cue.Shortcut = '123';
        cue.Time = 88.8;

        //Act
        let target = new XmlCue(cue);

        //Assert
        expect(target.Description).toBe(cue.Description);
        expect(target.Id).toBe(cue.Id);
        expect(target.Shortcut).toBe(cue.Shortcut);
        expect(target.Time).toBe(cue.Time);
    });
});
