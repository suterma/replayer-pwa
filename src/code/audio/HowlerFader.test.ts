/**
 * @jest-environment jsdom
 */

import { Howl } from 'howler';
import  HowlerFader from './HowlerFader';

describe('the HowerFader handler', function () {
    let testHowl = undefined as unknown as Howl;

    beforeEach(() => {
        // Arrange a howl (with the shortest possible mp3 in base64)
        testHowl = new Howl({
            src: [
                '/+MYxAAAAANIAAAAAExBTUUzLjk4LjIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            ],
            format: ['mp3'],
            preload:
                true /* This makes sure, the sound gets loaded even when there is no play action */,
            html5: true /* HTML5 audio is the variant used in replayer */,
        });
        //Mock the volume
        //(Otherwise the volume is not available, because the sound is not loaded in the testHowl),
        //to allow the tests to actually start fading either way
        testHowl.volume = () => {
            //The any type is required because there are overloads which can not be fulfilled easily
            return 0.5 as any;
        };
    });

    afterEach(() => {
        testHowl.unload();
    });

    it('should have logarithmic fade levels', () => {
        //Arrange
        const expectedPrecision = Math.pow(
            2,
            -16,
        ); /* This is the maximum resolution of 16 bits */
        testHowl.fade = jest.fn();
        const fader = new HowlerFader(testHowl, 0);

        //Assert
        expect(fader.logLevels[0]).toBeCloseTo(
            1 / Math.pow(2, 0),
            expectedPrecision,
        );
        expect(fader.logLevels[1]).toBeCloseTo(
            1 / Math.pow(2, 1),
            expectedPrecision,
        );
        expect(fader.logLevels[2]).toBeCloseTo(
            1 / Math.pow(2, 2),
            expectedPrecision,
        );
        expect(fader.logLevels[3]).toBeCloseTo(
            1 / Math.pow(2, 3),
            expectedPrecision,
        );
        expect(fader.logLevels[4]).toBeCloseTo(
            1 / Math.pow(2, 4),
            expectedPrecision,
        );
        expect(fader.logLevels[5]).toBeCloseTo(
            1 / Math.pow(2, 5),
            expectedPrecision,
        );
        expect(fader.logLevels[6]).toBeCloseTo(
            1 / Math.pow(2, 6),
            expectedPrecision,
        );
        expect(fader.logLevels[7]).toBeCloseTo(
            1 / Math.pow(2, 7),
            expectedPrecision,
        );
        expect(fader.logLevels[8]).toBeCloseTo(
            1 / Math.pow(2, 8),
            expectedPrecision,
        );
        expect(fader.logLevels[9]).toBeCloseTo(
            1 / Math.pow(2, 9),
            expectedPrecision,
        );
        expect(fader.logLevels[10]).toBeCloseTo(
            1 / Math.pow(2, 10),
            expectedPrecision,
        );
        expect(fader.logLevels[11]).toBeCloseTo(
            1 / Math.pow(2, 11),
            expectedPrecision,
        );
        expect(fader.logLevels[12]).toBeCloseTo(
            1 / Math.pow(2, 12),
            expectedPrecision,
        );
        expect(fader.logLevels[13]).toBeCloseTo(
            1 / Math.pow(2, 13),
            expectedPrecision,
        );
        expect(fader.logLevels[14]).toBeCloseTo(
            1 / Math.pow(2, 14),
            expectedPrecision,
        );
        expect(fader.logLevels[15]).toBeCloseTo(
            1 / Math.pow(2, 15),
            expectedPrecision,
        );
        expect(fader.logLevels[16]).toBeCloseTo(
            1 / Math.pow(2, 16),
            expectedPrecision,
        );
    });

    it('should not fade out when the duration is zero', () => {
        //Arrange
        testHowl.fade = jest.fn();
        const howlerFader = new HowlerFader(testHowl, 0);

        //Act
        const result = howlerFader.fadeOut();

        //Assert
        expect(testHowl.fade).toHaveBeenCalledTimes(0);
        expect(result).toBeInstanceOf(Promise);
    });

    it('should fade out when the duration is non-zero', () => {
        // Arrange
        testHowl.fade = jest.fn();
        const howlerFader = new HowlerFader(testHowl, 1000);

        //Act
        const result = howlerFader.fadeOut();

        //Assert
        expect(testHowl.fade).toHaveBeenCalledTimes(1);
        expect(result).toBeInstanceOf(Promise);
    });

    it('should not fade in when the duration is zero', () => {
        //Arrange
        testHowl.fade = jest.fn();
        const howlerFader = new HowlerFader(testHowl, 0);

        //Act
        const result = howlerFader.fadeIn();

        //Assert
        expect(testHowl.fade).toHaveBeenCalledTimes(0);
        expect(result).toBeInstanceOf(Promise);
    });

    it('should fade in when the duration is non-zero', () => {
        //Arrange
        testHowl.fade = jest.fn();
        const howlerFader = new HowlerFader(testHowl, 1000);

        //Act
        const result = howlerFader.fadeIn();

        //Assert
        expect(testHowl.fade).toHaveBeenCalledTimes(1);
        expect(result).toBeInstanceOf(Promise);
    });
});
