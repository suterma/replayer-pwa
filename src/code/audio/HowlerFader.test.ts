/**
 * @jest-environment jsdom
 */

import { Howl } from 'howler';
import HowlerFader from './HowlerFader';

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

    it('should not fade out when the duration is zero', () => {
        //Arrange
        const howlerFader = new HowlerFader(testHowl, 0);
        testHowl.fade = jest.fn(); //calls will be counted from here on

        //Act
        const result = howlerFader.fadeOut();

        //Assert
        expect(testHowl.fade).toHaveBeenCalledTimes(0);
        expect(result).toBeInstanceOf(Promise);
    });

    it('should fade out when the duration is non-zero', () => {
        // Arrange
        const howlerFader = new HowlerFader(testHowl, 1000);
        testHowl.fade = jest.fn(); //calls will be counted from here on

        //Act
        const result = howlerFader.fadeOut();

        //Assert
        expect(testHowl.fade).toHaveBeenCalledTimes(1);
        expect(result).toBeInstanceOf(Promise);
    });

    it('should not fade in when the duration is zero', () => {
        //Arrange
        const howlerFader = new HowlerFader(testHowl, 0);
        testHowl.fade = jest.fn(); //calls will be counted from here on

        //Act
        const result = howlerFader.fadeIn();

        //Assert
        expect(testHowl.fade).toHaveBeenCalledTimes(0);
        expect(result).toBeInstanceOf(Promise);
    });

    it('should fade in when the duration is non-zero', () => {
        //Arrange
        const howlerFader = new HowlerFader(testHowl, 1000);
        testHowl.fade = jest.fn(); //calls will be counted from here on

        //Act
        const result = howlerFader.fadeIn();

        //Assert
        expect(testHowl.fade).toHaveBeenCalledTimes(1);
        expect(result).toBeInstanceOf(Promise);
    });
});
