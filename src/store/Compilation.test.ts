/**
 * Copyright (c) 2024 Marcel Suter - Replayer
 *
 * This source code is licensed under the AGPL license found in the
 * LICENSE file in the root of this projects source tree.
 */

import { expect, describe, it } from 'vitest';
import { Compilation } from './Compilation';

/** Tests the compilation types and their methods */
describe('compilation-types.ts', () => {
    it('should deserialize a simple JSON compilation of type XML', () => {
        //Arrange
        const jsonCompilation =
            '{"Type":"XML","MediaPath":"media","Title":"Demo Compilation (Featuring Lidija Roos)","Url":"localhost:8080/demo-compilation-featuring-lidija-roos.rez","Id":"e1c2f85e-51c3-479f-bdd7-48f2439fd4b0","Tracks":[{"Name":"Not for Sale","Album":"Not for Sale","Artist":"Lidija Roos","Measure":114,"Url":"lidija_roos-not_for_sale.mp3","Id":"0139ff81-79f0-420d-aed5-d73daf199621","Cues":[{"Description":"","Id":"8a3c2217-e142-45ec-b733-42226e0993ab","Shortcut":"1","Time":0,"Duration":237.82675}],"Duration":237.82675,"Volume":0.5}],"PlaybackMode":"PlayCue"}';

        //Act
        const compilation = Compilation.fromJson(jsonCompilation);

        //Assert
        expect(compilation).toBeDefined();
        expect(compilation.Type).toBe('XML');
    });
});
