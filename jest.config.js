module.exports = {
    clearMocks: true,
  
    preset: 'ts-jest',
  
    testEnvironment: 'node',
    testEnvironmentOptions: {
      NODE_ENV: 'test',
      },
    setupFilesAfterEnv: ['<rootDir>/test/singleton.ts'],
  
  }