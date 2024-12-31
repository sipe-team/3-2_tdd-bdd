export default {
    preset: 'ts-jest',
    testEnvironment:'jest-fixed-jsdom',
    transform: {
        '^.+\\.tsx?$': 'ts-jest'
    },
    moduleNameMapper: {
        '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
        '^@/(.*)$': '<rootDir>/src/$1'
    },
    setupFilesAfterEnv: [
        '<rootDir>/src/setupTests.ts'
    ],

    testEnvironmentOptions: {
        url: 'http://localhost',
        customExportConditions: [''],
    }
};