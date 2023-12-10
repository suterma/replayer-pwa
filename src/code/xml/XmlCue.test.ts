import { expect, describe, it } from 'vitest';
import { Cue } from '@/store/Cue';
import { XmlCue } from './XmlCue';

describe('the XML mapping', function () {
    it('should return an initialised XmlCue object', function () {
        // Arrange
        const cue = new Cue('testDescription', '123', 88.8, 99.9, 'myId');

        //Act
        const target = new XmlCue(cue);

        //Assert
        expect(target.Description).toBe(cue.Description);
        expect(target.Id).toBe(cue.Id);
        expect(target.Shortcut).toBe(cue.Shortcut);
        expect(target.Time).toBe(cue.Time);
    });
});
