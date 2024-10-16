/**
 * @licstart The following is the entire license notice for the
 * JavaScript code in this page
 *
 * Copyright (c) 2024 Marcel Suter - Replayer
 *
 * This source code is licensed under the AGPL license found in the
 * LICENSE file in the root of this projects source tree.
 *
 * @licend The above is the entire license notice for the
 * JavaScript code in this page
 */

import { expect, describe, it } from 'vitest';
import FileHandler from './filehandler';
import JSZip from 'jszip';

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

    it('zip entry sorting should offer the Compilation XML always first, with regard to a text file', async () => {
        // Arrange
        const zip = new JSZip();
        zip.file('Hello.txt', 'Hello World\n');
        zip.file('Compilation.xml', '<xml></xml>');
        const file = await zip.generateAsync({ type: 'blob' });
        const archive = await JSZip.loadAsync(file);

        // Act
        const actualFileNameOrder: string[] = [];
        archive
            .filter(() => true)
            .sort(FileHandler.compareZipEntries)
            .forEach((zipEntry: JSZip.JSZipObject): void => {
                actualFileNameOrder.push(zipEntry.name);
            });

        // Assert
        expect(actualFileNameOrder[0]).toBe('Compilation.xml');
        expect(actualFileNameOrder[1]).toBe('Hello.txt');
    });

    it('zip entry sorting should offer the Compilation XML always first, with regard to a mp3 file', async () => {
        // Arrange
        const zip = new JSZip();
        zip.file('01.mp3', 'audio');
        zip.file('Compilation.xml', '<xml></xml>');
        const file = await zip.generateAsync({ type: 'blob' });
        const archive = await JSZip.loadAsync(file);

        // Act
        const actualFileNameOrder: string[] = [];
        archive
            .filter(() => true)
            .sort(FileHandler.compareZipEntries)
            .forEach((zipEntry: JSZip.JSZipObject): void => {
                actualFileNameOrder.push(zipEntry.name);
            });

        // Assert
        expect(actualFileNameOrder[0]).toBe('Compilation.xml');
        expect(actualFileNameOrder[1]).toBe('01.mp3');
    });

    it('zip entry sorting should offer the Compilation XML always first, with regard to an arbitrary file', async () => {
        // Arrange
        const zip = new JSZip();
        zip.file('draw.cdr', 'corel draw');
        zip.file('Compilation.xml', '<xml></xml>');
        const file = await zip.generateAsync({ type: 'blob' });
        const archive = await JSZip.loadAsync(file);

        // Act
        const actualFileNameOrder: string[] = [];
        archive
            .filter(() => true)
            .sort(FileHandler.compareZipEntries)
            .forEach((zipEntry: JSZip.JSZipObject): void => {
                actualFileNameOrder.push(zipEntry.name);
            });

        // Assert
        expect(actualFileNameOrder[0]).toBe('Compilation.xml');
        expect(actualFileNameOrder[1]).toBe('draw.cdr');
    });

    it('zip entry sorting should offer the music files alphabetically sorted', async () => {
        // Arrange
        const zip = new JSZip();
        zip.file('02.mp3', 'audio');
        zip.file('Intro.mp3', 'audio');
        zip.file('Solo.mp3', 'audio');
        zip.file('01.mp3', 'audio');
        const file = await zip.generateAsync({ type: 'blob' });
        const archive = await JSZip.loadAsync(file);

        // Act
        const actualFileNameOrder: string[] = [];
        archive
            .filter(() => true)
            .sort(FileHandler.compareZipEntries)
            .forEach((zipEntry: JSZip.JSZipObject): void => {
                actualFileNameOrder.push(zipEntry.name);
            });

        // Assert
        expect(actualFileNameOrder[0]).toBe('01.mp3');
        expect(actualFileNameOrder[1]).toBe('02.mp3');
        expect(actualFileNameOrder[2]).toBe('Intro.mp3');
        expect(actualFileNameOrder[3]).toBe('Solo.mp3');
    });

    it('should determine the missing file ending for a google drive file download properly', async () => {
        // Arrange
        const urlPath = '/uc';

        // Act
        const actual = FileHandler.hasNoFileEnding(urlPath);

        // Assert
        expect(actual).toBe(true);
    });

    it('should determine the missing file ending for a microsoft onedrive file download properly', async () => {
        // Arrange
        const urlPath = '/download';

        // Act
        const actual = FileHandler.hasNoFileEnding(urlPath);

        // Assert
        expect(actual).toBe(true);
    });

    it('should determine the existing file ending for a dropbox file download properly', async () => {
        // Arrange
        const urlPath =
            '/scl/fi/lh4jw17lw5s0i847ogvzw/your-light-by-lidija-roos.mp3';

        // Act
        const actual = FileHandler.hasNoFileEnding(urlPath);

        // Assert
        expect(actual).toBe(false);
    });

    it('should recognise supported file types properly', async () => {
        // Act & Assert
        expect(FileHandler.isSupportedFileName('/path/file.PDF')).toBe(true);
        expect(FileHandler.isSupportedFileName('/path/file.pdf')).toBe(true);
        expect(FileHandler.isSupportedFileName('/path/file.mp3')).toBe(true);
        expect(FileHandler.isSupportedFileName('/path/file.MP3')).toBe(true);
        expect(FileHandler.isSupportedFileName('/path/file.txt')).toBe(true);
        expect(FileHandler.isSupportedFileName('/path/file.flac')).toBe(true);
        expect(FileHandler.isSupportedFileName('/path/file.Flac')).toBe(true);

        expect(FileHandler.isSupportedFileName('/path/file.xyz')).toBe(false);
        expect(FileHandler.isSupportedFileName('/path/file.abc')).toBe(false);
        expect(FileHandler.isSupportedFileName('/path/file.1')).toBe(false);
    });

    it('should recognise supported file types properly', async () => {
        // Act & Assert
        expect(FileHandler.isVideoFileName('/path/file.mp4')).toBe(true);
        expect(FileHandler.isVideoFileName('/path/file.MP4')).toBe(true);

        expect(FileHandler.isVideoFileName('/path/file.xyz')).toBe(false);
        expect(FileHandler.isVideoFileName('/path/file.abc')).toBe(false);
        expect(FileHandler.isVideoFileName('/path/file.1')).toBe(false);
    });

    it('should recognise disregard URL query parameters', async () => {
        // Act & Assert
        expect(
            FileHandler.isSupportedFileName('/path/file.PDF?param=val'),
        ).toBe(true);
        expect(
            FileHandler.isSupportedFileName('/path/file.pdf?param=val'),
        ).toBe(true);
        expect(
            FileHandler.isSupportedFileName('/path/file.mp3?param=val'),
        ).toBe(true);
        expect(
            FileHandler.isSupportedFileName('/path/file.MP3?param=val'),
        ).toBe(true);
        expect(
            FileHandler.isSupportedFileName('/path/file.txt?param=val'),
        ).toBe(true);
        expect(
            FileHandler.isSupportedFileName('/path/file.flac?param=val'),
        ).toBe(true);
        expect(
            FileHandler.isSupportedFileName('/path/file.Flac?param=val'),
        ).toBe(true);

        // some fake extensions
        expect(
            FileHandler.isSupportedFileName('/path/file.xyz?param=wouldbe.mp3'),
        ).toBe(false);
        expect(
            FileHandler.isSupportedFileName('/path/file.abc?param=wouldbe.mp3'),
        ).toBe(false);
        expect(
            FileHandler.isSupportedFileName('/path/file.1?param=wouldbe.mp3'),
        ).toBe(false);
    });
});
