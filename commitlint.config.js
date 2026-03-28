/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Restrict to only these types
    'type-enum': [2, 'always', ['fix', 'feat', 'chore', 'ci', 'hotfix']],
    // Scope is optional
    'scope-case': [2, 'always', 'lower-case'],
    // Subject must not be empty
    'subject-empty': [2, 'never'],
    // Subject must start with lowercase
    'subject-case': [2, 'always', 'lower-case'],
  },
}
