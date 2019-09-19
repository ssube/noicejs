import { join, sep } from 'path';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import multiEntry from 'rollup-plugin-multi-entry';
import replace from 'rollup-plugin-replace';
import resolve from 'rollup-plugin-node-resolve';
import tslint from 'rollup-plugin-tslint';
import typescript from 'rollup-plugin-typescript2';

const metadata = require('../package.json');
const namedExports = require('./rollup-named.json');
const shebang = '#! /usr/bin/env node\n\n';

const rootPath = process.env['ROOT_PATH'];
const targetPath = process.env['TARGET_PATH'];

const bundle = {
	external: [
		'async_hooks',
		'chai',
		'sinon',
	],
	input: [
		join(rootPath, 'src', 'index.ts'),
		join(rootPath, 'test', 'harness.ts'),
		join(rootPath, 'test', '**', 'Test*.ts'),
	],
	manualChunks(id) {
		if (id.includes(`${sep}test${sep}`)) {
			return 'test'
		}

		if (id.includes(`${sep}node_modules${sep}`)) {
			return 'vendor';
		}

		if (id.includes(`${sep}src${sep}index`)) {
			return 'index';
		}

		if (id.includes(`${sep}src${sep}`)) {
			return 'main';
		}
	},
	output: {
		dir: targetPath,
		chunkFileNames: '[name].js',
		entryFileNames: 'entry-[name].js',
		format: 'cjs',
		sourcemap: true,
		banner: () => {
			return ''; // @TODO: return shebang for executable scripts
		},
	},
	plugins: [
		multiEntry(),
		json(),
		replace({
			delimiters: ['{{ ', ' }}'],
			values: {
				BUILD_JOB: process.env['CI_JOB_ID'],
				BUILD_RUNNER: process.env['CI_RUNNER_DESCRIPTION'],
				GIT_BRANCH: process.env['CI_COMMIT_REF_SLUG'],
				GIT_COMMIT: process.env['CI_COMMIT_SHA'],
				NODE_VERSION: process.env['NODE_VERSION'],
				PACKAGE_NAME: metadata.name,
				PACKAGE_VERSION: metadata.version,
			},
		}),
		resolve({
			preferBuiltins: true,
		}),
		commonjs({
			namedExports,
		}),
		tslint({
			configuration: require('./tslint.json'),
			throwOnError: true,
		}),
		typescript({
			cacheRoot: join(targetPath, 'cache/rts2'),
			rollupCommonJSResolveHack: true,
		}),
	],
};

export default [
	bundle,
];
