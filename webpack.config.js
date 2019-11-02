var path = require('path');

const isDevelopment = process.env.NODE_ENV === 'development'

module.exports = {
	mode: 'production',
	entry: './src/CardInput/index.js',
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				use: ['babel-loader']
			},
			{
				test: /\.module\.s[ac]ss$/,
				use: [
					'style-loader',
					{
						loader: 'css-loader',
						options: {
							modules: true,
							sourceMap: isDevelopment
						}
					},
					{
						loader: 'sass-loader',
						options: {
							sourceMap: isDevelopment
						}
					}
				]
			}
		]
	},
	resolve: {
		extensions: ['*', '.js', '.jsx', '.scss']
	},
	output: {
		path: path.resolve('lib'),
		filename: 'CardInput.js',
		libraryTarget: 'commonjs2'
	}
};