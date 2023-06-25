module.exports = {
    moduleFileExtensions: [
        'js',
        'json',
        'ts',
        // tell Jest to handle `*.vue` files
        'vue',
    ],
    /*transformIgnorePatterns: ['<rootDir>/node_modules/'],*/
    transform: {
        /** Use the Typescript runner for testing ts code */
        '^.+\\.ts?$': 'ts-jest',
        /** Use the vue-jest transformer for mapping .vue single-file components */
        '^.+\\.(vue)$': '@vue/vue3-jest',
    },
    moduleDirectories: ['node_modules', 'src'],
    /** Allow the use of the @ symbol for absolute paths within the app */
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^lib/(.*)$': '<rootDir>/common/$1',
    },
    setupFiles: ['core-js'],
    reporters: ['default', 'jest-junit'],
};
