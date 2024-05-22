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

import { expect, describe, it, beforeEach, afterEach } from 'vitest';
import { MediaBlob } from './types';
import CompilationHandler from './compilation-handler';
import { Compilation } from './Compilation';

describe('CompilationHandler.ts', () => {
    let mediaBlobs = new Array<MediaBlob>();

    beforeEach(() => {
        const dataBase64 = 'VEhJUyBJUyBUSEUgQU5TV0VSCg==';
        const arrayBuffer = Uint8Array.from(window.atob(dataBase64), (c) =>
            c.charCodeAt(0),
        );
        const firstBlob = new Blob([arrayBuffer], {
            type: 'application/pdf',
        });

        mediaBlobs.push(new MediaBlob('first.name', firstBlob));
        mediaBlobs.push(new MediaBlob('second.name', firstBlob));
        mediaBlobs.push(new MediaBlob('third.name', firstBlob));
    });

    afterEach(() => {
        mediaBlobs = new Array<MediaBlob>();
    });

    it('should not sort the blobs when no matching name is given', async () => {
        //Arrange

        //Act
        const sortedMediaBlobs = CompilationHandler.sortByFirstFileName(
            mediaBlobs,
            'anyname',
        );

        //Assert
        //The order should be unchanged
        expect(sortedMediaBlobs[0]?.fileName).toBe('first.name');
        expect(sortedMediaBlobs[1]?.fileName).toBe('second.name');
        expect(sortedMediaBlobs[2]?.fileName).toBe('third.name');
    });

    it('should not sort the blobs when no name is given', async () => {
        //Arrange

        //Act
        const sortedMediaBlobs = CompilationHandler.sortByFirstFileName(
            mediaBlobs,
            undefined,
        );

        //Assert
        //The order should be unchanged
        expect(sortedMediaBlobs[0]?.fileName).toBe('first.name');
        expect(sortedMediaBlobs[1]?.fileName).toBe('second.name');
        expect(sortedMediaBlobs[2]?.fileName).toBe('third.name');
    });

    it('should sort the blobs in order for the given track name', async () => {
        //Arrange

        //Act
        const sortedMediaBlobs = CompilationHandler.sortByFirstFileName(
            mediaBlobs,
            'third.name',
        );

        //Assert
        expect(sortedMediaBlobs[0]?.fileName).toBe('third.name');
    });

    it('should sort the blobs in order for the given second track name', async () => {
        //Arrange

        //Act
        const sortedMediaBlobs = CompilationHandler.sortByFirstFileName(
            mediaBlobs,
            'second.name',
        );

        //Assert
        expect(sortedMediaBlobs[0]?.fileName).toBe('second.name');
    });

    it('should sort the blobs in order for the given ending track name', async () => {
        //Arrange

        //Act
        const sortedMediaBlobs = CompilationHandler.sortByFirstFileName(
            mediaBlobs,
            'ird.name',
        );

        //Assert
        expect(sortedMediaBlobs[0]?.fileName).toBe('third.name');
    });

    it('should sort the blobs in order for the given distorted track name', async () => {
        //Arrange

        //Act
        const sortedMediaBlobs = CompilationHandler.sortByFirstFileName(
            mediaBlobs,
            '�third.name',
        );

        //Assert
        expect(sortedMediaBlobs[0]?.fileName).toBe('third.name');
    });

    it('should resolve mixed case for lazy conversion', async () => {
        //Arrange

        //Act
        const actual = CompilationHandler.getLazyFileName('SomeName');

        //Assert
        expect(actual).toEqual(CompilationHandler.getLazyFileName('somename'));
    });

    it('should resolve non-printable characters for lazy conversion', async () => {
        //Arrange

        //Act
        const actual = CompilationHandler.getLazyFileName('Some\rName');

        //Assert
        expect(actual).toEqual(CompilationHandler.getLazyFileName('SOMEname'));
    });

    it('should resolve other non-printable characters for lazy conversion', async () => {
        //Arrange

        //Act
        const actual = CompilationHandler.getLazyFileName(
            '01 OuvertБre_pb.mp3',
        );

        //Assert
        expect(actual).toEqual(
            CompilationHandler.getLazyFileName('01 Ouvertüre_pb.mp3'),
        );
    });

    it('should provide a proper file name for a fully annotated complilation', async () => {
        //Arrange
        const testCompilation = new Compilation(
            'c:\\file',
            'test-title',
            'test-artist',
            'test-album',
            'test-url',
            'test-id',
            [],
        );

        //Act
        const actual =
            CompilationHandler.getCompilationFileName(testCompilation);

        //Assert
        expect(actual).toEqual('test-title by test-artist on test-album');
    });

    it('should provide a proper file name for a title-only complilation', async () => {
        //Arrange
        const testCompilation = new Compilation(
            'c:\\file',
            'test-title',
            ' ',
            ' ',
            'test-url',
            'test-id',
            [],
        );

        //Act
        const actual =
            CompilationHandler.getCompilationFileName(testCompilation);

        //Assert
        expect(actual).toEqual('test-title');
    });

    it('should provide a proper file name for a title and artist complilation', async () => {
        //Arrange
        const testCompilation = new Compilation(
            'c:\\file',
            'test-title',
            'test-artist',
            ' ',
            'test-url',
            'test-id',
            [],
        );

        //Act
        const actual =
            CompilationHandler.getCompilationFileName(testCompilation);

        //Assert
        expect(actual).toEqual('test-title by test-artist');
    });

    it('should provide a proper file name for a title and album complilation', async () => {
        //Arrange
        const testCompilation = new Compilation(
            'c:\\file',
            'test-title',
            ' ',
            'test-album ',
            'test-url',
            'test-id',
            [],
        );

        //Act
        const actual =
            CompilationHandler.getCompilationFileName(testCompilation);

        //Assert
        expect(actual).toEqual('test-title on test-album');
    });
});
