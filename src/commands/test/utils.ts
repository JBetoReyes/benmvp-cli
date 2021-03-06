import { resolve } from 'path'
import { TestMode } from '../types'

interface ValidTestModes {
  type: string
  lint: string
  spec: string
  [index: string]: string
}
export interface Args {
  modes: TestMode[]
  pattern: string
  watch: boolean
}

// NOTE: Ideally we'd point to project configuration objects for
// each type instead of files that contain the configuration, but
// Jest kept throwing an error even though it says it supports the
// functionality. See: https://github.com/facebook/jest/issues/7415
export const VALID_TEST_MODES: ValidTestModes = {
  type: resolve(__dirname, 'project-type.js'),
  lint: resolve(__dirname, 'project-lint.js'),
  spec: resolve(__dirname, 'project-spec.js'),
}

/**
 * Retrieves the arguments to pass to Jest based on the specified options
 * @param {Args} options The configuration options for testing the library
 * @param {TestMode[]} options.modes List of the types or modes of tests to run
 * @param {string} options.pattern  Regexp pattern string that is matched against all
 *  tests paths before executing the test
 * @param {boolean} options.watch Whether or not to re-run tests as source files change
 * @returns {string[]} The array of arguments
 */
export const getJestArgs = ({ modes, pattern, watch }: Args): string[] => {
  const validModes = modes.filter((mode) => mode in VALID_TEST_MODES)

  if (!validModes.length || validModes.length < modes.length) {
    throw new Error(`Invalid test modes specified: ${modes}`)
  }

  const projects = validModes.map((mode) => VALID_TEST_MODES[mode])
  const jestArgs = ['--projects', ...projects]

  if (pattern) {
    jestArgs.push('--testPathPattern', pattern)
  }

  if (watch) {
    jestArgs.push('--watch')
  }

  if (process.env.CI === 'true') {
    jestArgs.push('--ci')
  }

  return jestArgs
}
