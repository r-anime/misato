const path = require('path');

const VueLoaderPlugin = require('vue-loader/lib/plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const config = require('./config');

module.exports = {
	mode: config.dev ? 'development' : 'production',
	entry: {
		management: './web/frontend/management/index.js',
	},
	output: {
		path: config.web.frontendBuildDir,
		filename: '[name]/bundle.js',
	},
	module: {
		rules: [
			{test: /\.vue$/, loader: 'vue-loader'},
			{test: /\.s[ac]ss/, use: ['style-loader', 'css-loader', 'sass-loader']},
		],
	},
	plugins: [
		new VueLoaderPlugin(),
		// Create HTML base for management interface
		new HtmlWebpackPlugin({
			template: './web/frontend/management/template.html',
			chunks: ['management'],
			filename: 'management/index.html',
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
