import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  dir: './',
})

/** @type {import('jest').Config} */
const config = {
  moduleNameMapper: {
    '^@/(.+)': '<rootDir>/$1',
  },
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        publicPath: './tests/unit',
        filename: 'report.html',
      },
    ],
  ],
  testEnvironment: 'jsdom',
  coverageDirectory: 'common_frontend_coverage',
  coverageReporters: ['text', 'clover'],
}

export default createJestConfig(config)
