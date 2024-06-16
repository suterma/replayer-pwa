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
import { Compilation } from '@/store/Compilation';
import { type ITrack } from '@/store/ITrack';
import { XmlCompilation } from './XmlCompilation';

describe('the XML mapping', function () {
    it('should return an initialised XmlCompilation object', function () {
        // Arrange
        const compilation = new Compilation(
            'c:\\temp',
            'testTitle',
            'testArtist',
            'testAlbum',
            'https://test.example.com/music',
            'compilationId',
            new Array<ITrack>(),
            new Set<string>(['someSelectedTag']),
        );

        //Act
        const target = new XmlCompilation(compilation);

        //Assert
        expect(target.Id).toBe(compilation.Id);
        expect(target.MediaPath).toBe(compilation.MediaPath);
        expect(target.Title).toBe(compilation.Title);
        expect(target.Artist).toBe(compilation.Artist);
        expect(target.Album).toBe(compilation.Album);
        expect(target.Tracks.Track).toHaveLength(0);
        expect(target.SelectedTags).toHaveLength(1);
    });
});
