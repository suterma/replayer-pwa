/**
 * @jest-environment jsdom
 */

import CompilationParser from './compilation-parser';

describe('compilation-parser.ts', () => {
    it('should parse an undefined track when the query is empty', () => {
        //Arrange
        const query = { x: 'test', y: 'zwei' };

        //Act
        const track = CompilationParser.parseFromUrlQuery(query);

        //Assert
        expect(track).toBeUndefined();
    });
});
