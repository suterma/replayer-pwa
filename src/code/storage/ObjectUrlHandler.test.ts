import {
    describe,
    it,
    beforeEach,
    afterEach,
    expect,
    vi,
    type MockInstance,
} from 'vitest';
import { ObjectUrlHandler } from './ObjectUrlHandler';

describe('ObjectUrlHandler.ts', () => {
    //https://stackoverflow.com/a/56643520
    beforeEach(() => {
        URL.createObjectURL = vi.fn();
        URL.revokeObjectURL = vi.fn();
    });

    afterEach(() => {
        //https://stackoverflow.com/a/60300568
        (URL.createObjectURL as unknown as MockInstance).mockRestore();
        (URL.revokeObjectURL as unknown as MockInstance).mockRestore();
    });
    it('should store a blob', async () => {
        //Arrange
        const dataBase64 = 'VEhJUyBJUyBUSEUgQU5TV0VSCg==';
        const arrayBuffer = Uint8Array.from(window.atob(dataBase64), (c) =>
            c.charCodeAt(0),
        );
        const file = new File([arrayBuffer], 'dummy.pdf', {
            type: 'application/pdf',
        });

        //Act
        ObjectUrlHandler.createObjectURL(file, 'dummy.pdf');

        //Assert
        expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    });

    it('should revoke a blob url', async () => {
        //Arrange

        //Act
        ObjectUrlHandler.revokeObjectURL('dummyUrl');

        //Assert
        expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1);
    });
});
