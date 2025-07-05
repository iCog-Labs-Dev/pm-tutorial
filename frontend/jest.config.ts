module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/setupTests.js'],
  moduleFileExtensions: ['js','jsx','ts','tsx'],
    transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'ts-jest'
  },
};