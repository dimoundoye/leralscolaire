const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  { ignores: ['node_modules', 'uploads', 'exports'] },
  {
    files: ['**/*.js'],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'commonjs',
      globals: globals.node,
    },
    rules: {
      ...js.configs.recommended.rules,
      // Les paramètres Express inutilisés (req, res, next) et les erreurs ignorées sont tolérés s'ils commencent par _
      'no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_|^(req|res|next)$', varsIgnorePattern: '^_', caughtErrors: 'none' },
      ],
    },
  },
  {
    files: ['tests/**/*.js'],
    languageOptions: { globals: { ...globals.node, fetch: 'readonly' } },
  },
];
