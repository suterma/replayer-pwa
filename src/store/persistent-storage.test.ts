// //TODO eanble test or rewrite them for vitest: https://vitest.dev/guide/migration.html#migrating-from-jest

// import PersistentStorage from '@/store/persistent-storage';

// describe('persistent-storage.ts', () => {
//     it('should return null when null was stored', () => {
//         //Arrange
//         const testid = null;
//         PersistentStorage.storeSelectedCueId(testid);

//         //Act & Assert
//         expect.assertions(1);
//         return PersistentStorage.retrieveSelectedCueId().then((actual) =>
//             expect(actual).toBeNull(),
//         );
//     });

//     it('should return the value when a value was stored', () => {
//         //Arrange
//         const testid = 'testid';
//         PersistentStorage.storeSelectedCueId(testid);

//         //Act & Assert
//         expect.assertions(1);
//         return PersistentStorage.retrieveSelectedCueId().then((actual) =>
//             expect(actual).toBe(testid),
//         );
//     });

//     it('should return null when an empty string was stored', () => {
//         //Arrange
//         const testid = '';
//         PersistentStorage.storeSelectedCueId(testid);

//         //Act & Assert
//         expect.assertions(1);
//         return PersistentStorage.retrieveSelectedCueId().then((actual) =>
//             expect(actual).toBeNull(),
//         );
//     });
// });
