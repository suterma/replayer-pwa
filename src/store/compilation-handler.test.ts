/**
 * @jest-environment jsdom
 */

import { MediaBlob } from '@/store/state-types';
import CompilationHandler from './compilation-handler';

describe('CompilationHandler.ts', () => {
    it('should sort the blobs in order for the given track name', async () => {
        //Arrange
        const dataBase64 = 'VEhJUyBJUyBUSEUgQU5TV0VSCg==';
        const arrayBuffer = Uint8Array.from(window.atob(dataBase64), (c) =>
            c.charCodeAt(0),
        );
        const firstBlob = new Blob([arrayBuffer], {
            type: 'application/pdf',
        });

        const mediaBlob = new MediaBlob('first.name', firstBlob);

        const mediaBlobs = new Array<MediaBlob>();
        mediaBlobs.push(mediaBlob);

        //Act
        CompilationHandler.sortByFirstFileName(mediaBlobs, 'anyname');

        //Assert
        expect(mediaBlobs[0].fileName).toEqual('first.name');

        fail(
            '//TODO make more blobs, and use actually more complicated file names',
        );
    });
});
