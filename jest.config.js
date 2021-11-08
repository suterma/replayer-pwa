module.exports = {
    moduleFileExtensions: ['js','ts', 'vue'],
    transformIgnorePatterns:['<rootDir>/node_modules/'],
    /** Use the Typescript runner for testing ts code */
    transform: {
        '^.+\\.ts?$': 'ts-jest'
      },
    moduleDirectories: ["node_modules", "src"],
    /** Allow the use of the @ symbol for absolute paths within the app */
     moduleNameMapper: {
       '^@/(.*)$': '<rootDir>/src/$1',
       '^lib/(.*)$': '<rootDir>/common/$1',
     },
}
