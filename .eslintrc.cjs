module.exports = {
	plugins: [
		'@typescript-eslint',
		'import',
	],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		sourceType: 'module',
	},
	extends: [
		'@geo1088/ts',
		'plugin:import/recommended',
	],
	env: {
		node: true,
	},
	rules: {
		'func-style': ['error', 'declaration', {allowArrowFunctions: true}],
		'no-use-before-define': ['error', {functions: false}],
		'prefer-promise-reject-errors': ['error', {allowEmptyReject: true}],
		// References to the config file will be undefined in CI
		'import/no-unresolved': ['error', {ignore: ['(\\.?\\.\\/)+config$']}],
		'@typescript-eslint/no-empty-function': ['warn', {allow: ['arrowFunctions']}],
		'@typescript-eslint/no-unused-vars': ['error', {
			varsIgnorePattern: '^_',
			argsIgnorePattern: '^_',
			caughtErrorsIgnorePattern: '^_',
		}],
	},
	overrides: [
		{
			// disable certain rules for Javascript files
			files: ['*.js'],
			rules: {
				// Javascript file exports are allowed to not be typed
				'@typescript-eslint/explicit-module-boundary-types': ['off'],
			},
		},
		{
			// disable other certain rules for TS files
			files: ['*.ts'],
			rules: {
				'valid-jsdoc': ['off'],
			},
		},
	],
};
