import { expect, describe, it, beforeEach, afterEach } from 'vitest';
import FileHandler from './filehandler';

describe('filehandler.ts', () => {
    it('should parse a MT-Cambrige URL into useful track metadata', async () => {
        // Arrange
        const url = new URL(
            'https://previews.cambridge-mt.com/OnesAndZeroes_Full_Preview.mp3',
        );

        // Act
        const trackMetadata = FileHandler.extractTrackMetadataFromUrl(url);

        // Assert
        expect(trackMetadata.name).toBe('OnesAndZeroes Full Preview');
        expect(trackMetadata.artist).toBe('');
        expect(trackMetadata.album).toBe('cambridge-mt');
    });

    it('should parse a Christof Fankhauser URL into useful track metadata', async () => {
        // Arrange
        const url = new URL(
            'https://www.christoffankhauser.ch/app/download/19605157225/M%C3%84_01%20D%20Fr%C3%B6id%20wecke%20PLAYBACK.mp3?t=1689345565',
        );

        // Act
        const trackMetadata = FileHandler.extractTrackMetadataFromUrl(url);

        // Assert
        expect(trackMetadata.name).toBe('MÄ 01 D Fröid wecke PLAYBACK');
        expect(trackMetadata.artist).toBe('');
        expect(trackMetadata.album).toBe('christoffankhauser');
    });

    it('should parse a Security Now URL into useful track metadata', async () => {
        // Arrange
        const url = new URL(
            'https://pdst.fm/e/pscrb.fm/rss/p/cdn.twit.tv/libsyn/sn_944/c18d5d13-9b48-44ea-9b24-b368f6c8d6c7/R1_sn0944.mp3',
        );

        // Act
        const trackMetadata = FileHandler.extractTrackMetadataFromUrl(url);

        // Assert
        expect(trackMetadata.name).toBe('R1 sn0944');
        expect(trackMetadata.artist).toBe('');
        expect(trackMetadata.album).toBe('pdst');
    });

    it('should parse an SRF digital URL into useful track metadata', async () => {
        // Arrange
        const url = new URL(
            'https://podcasts.srf.ch/world/audio/Digital-Podcast_22-12-2023-1400.1703246609079.mp3',
        );

        // Act
        const trackMetadata = FileHandler.extractTrackMetadataFromUrl(url);

        // Assert
        expect(trackMetadata.name).toBe(
            'Digital Podcast 22 12 2023 1400 1703246609079',
        );
        expect(trackMetadata.artist).toBe('');
        expect(trackMetadata.album).toBe('srf');
    });
});
