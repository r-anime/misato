const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
	devtool: process.env.NODE_ENV === 'production' ? false : 'source-map',
	entry: './frontend/index.js',
	output: {
		path: path.resolve(__dirname, 'frontend/dist'),
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
