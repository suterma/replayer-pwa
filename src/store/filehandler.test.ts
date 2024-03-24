/**
 * Copyright (c) 2024 Marcel Suter - Replayer
 *
 * This source code is licensed under the AGPL license found in the
 * LICENSE file in the root of this projects source tree.
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
});
