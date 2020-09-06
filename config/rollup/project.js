const externals = require('rollup-plugin-node-externals');

module.exports = {
  plugins: [
		externals({
			builtins: true,
			deps: true,
			devDeps: false,
			peerDeps: false,
		}),
  ],
};
