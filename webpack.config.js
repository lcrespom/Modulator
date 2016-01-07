module.exports = {
	devtool: 'source-map',
	entry: {
		bundle: './ts/main',
		synthlib: './ts/synthlib' 	
	},
	output: {
		path: __dirname + '/js',
		filename: '[name].js'
	},
	resolve: {
		extensions: ['.ts']
	},
	module: {
		loaders: [
			{
				test: /\.ts$/,
				loader: 'ts-loader'
			}
		]
	}
};