const VueLoaderPlugin = require('vue-loader/lib/plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const config = require('./config');

module.exports = {
	mode: config.dev ? 'development' : 'production',
	devtool: config.dev ? 'source-map' : false,
	entry: './frontend/index.js',
	output: {
		path: config.web.frontendBuildDir,
		filename: 'bundle.js',
		publicPath: '/',
	},
	module: {
		rules: [
			{test: /\.vue$/, loader: 'vue-loader'},
			{test: /\.s[ac]ss/, use: ['style-loader', 'css-loader', 'sass-loader']},
		],
	},
	plugins: [
		new VueLoaderPlugin(),
		// Create HTML base
		new HtmlWebpackPlugin({
			template: './frontend/template.html',
			filename: 'index.html',
			title: 'test',
		}),
	],
	resolve: {
		alias: {
			vue$: 'vue/dist/vue.esm.js',
		},
		extensions: ['*', '.js', '.vue', '.json'],
	},
};
