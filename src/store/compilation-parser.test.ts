/**
 * @jest-environment jsdom
 */

import { LocationQuery } from 'vue-router';
import CompilationParser from './compilation-parser';

describe('compilation-parser.ts', () => {
    it('should parse an undefined track when the query is empty', () => {
        //Arrange
        const query = {} as LocationQuery;

        //Act
        const track = CompilationParser.parseFromUrlQuery(query);

        //Assert
        expect(track).toBeUndefined();
    });

    it('should parse a full query to a complete track', () => {
        //Arrange

        const query = {
            media: 'https://web.replayer.app/music/your-light-by-lidija-roos.mp3',
            title: 'Your Light',
            artist: 'Lidija Roos',
            album: 'Not For Sale',
            '6.49': 'Intro',
        } as LocationQuery;

        console.debug('jest', query);

        //Act
        const track = CompilationParser.parseFromUrlQuery(query);

        //Assert
        expect(track).toBeDefined();
        expect(track?.Url).toBe(
            'https://web.replayer.app/music/your-light-by-lidija-roos.mp3',
        );
        expect(track?.Name).toBe('Your Light');
        expect(track?.Artist).toBe('Lidija Roos');
        expect(track?.Album).toBe('Not For Sale');
        expect(track?.Duration).toBeNull(); //"Because a duration is only available after track loading in the player."
        expect(track?.Cues).toBeDefined();
        expect(track?.Cues).toHaveLength(1);
        expect(track?.Cues[0]?.Description).toBe('Intro');
        expect(track?.Cues[0]?.Time).toBe(6.49);
        expect(track?.Cues[0]?.Id).toBeDefined();
        expect(track?.Cues[0]?.Duration).toBeNull(); //"Because a duration is only available after track loading in the player."
        expect(track?.Cues[0]?.Shortcut).toBeNull(); //because there is none
    });

    it('should parse multliple cues into a list', () => {
        //Arrange

        const query = {
            media: 'https://web.replayer.app/music/your-light-by-lidija-roos.mp3',
            6.49: 'Intro',
            12.1: 'Intro2',
        } as LocationQuery;

        //Act
        const track = CompilationParser.parseFromUrlQuery(query);

        //Assert
        expect(track).toBeDefined();
        expect(track?.Cues).toBeDefined();
        expect(track?.Cues).toHaveLength(2);
        expect(track?.Cues[0]?.Description).toBe('Intro');
        expect(track?.Cues[0]?.Time).toBe(6.49);
        expect(track?.Cues[0]?.Id).toBeDefined();
        expect(track?.Cues[0]?.Duration).toBeNull(); //"Because a duration is only available after track loading in the player."
        expect(track?.Cues[0]?.Shortcut).toBeNull(); //because there is none
        expect(track?.Cues[1]?.Description).toBe('Intro2');
        expect(track?.Cues[1]?.Time).toBe(12.1);
        expect(track?.Cues[1]?.Id).toBeDefined();
        expect(track?.Cues[1]?.Duration).toBeNull(); //"Because a duration is only available after track loading in the player."
        expect(track?.Cues[1]?.Shortcut).toBeNull(); //because there is none
    });

    it('should parse a single cue with time 0 correctly', () => {
        //Arrange

        const query = {
            media: 'https://web.replayer.app/music/your-light-by-lidija-roos.mp3',
            0: 'Zero',
        } as LocationQuery;

        //Act
        const track = CompilationParser.parseFromUrlQuery(query);

        //Assert
        expect(track).toBeDefined();
        expect(track?.Cues).toBeDefined();
        expect(track?.Cues).toHaveLength(1);
        expect(track?.Cues[0]?.Time).toBe(0);
        expect(track?.Cues[0]?.Description).toBe('Zero');
    });

    it('should parse multiple cues with an integer time correctly', () => {
        //Arrange

        const query = {
            media: 'https://web.replayer.app/music/your-light-by-lidija-roos.mp3',
            12: 'Twelve',
            13: 'Thirteen',
        } as LocationQuery;

        //Act
        const track = CompilationParser.parseFromUrlQuery(query);

        //Assert
        expect(track?.Cues[0]?.Time).toBe(12);
        expect(track?.Cues[0]?.Description).toBe('Twelve');
        expect(track?.Cues[1]?.Time).toBe(13);
        expect(track?.Cues[1]?.Description).toBe('Thirteen');
    });
});
