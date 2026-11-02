const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
// 自定义你 webpackConfig 配置， 来支持 monaco 插件，实现 CodeEditor 组件
module.exports = function (webpackConfig) {

    webpackConfig.module.rules.push({
        oneOf: [
            {
                test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                loader: require.resolve('url-loader'),
                options: {
                    limit: 100000,
                    name: 'static/media/[name].[hash:8].[ext]',
                },
            },
            {
                loader: require.resolve('file-loader'),
                // Exclude `js` files to keep "css" loader working as it injects
                // its runtime that would otherwise be processed through "file" loader.
                // Also exclude `html` and `json` extensions so they get processed
                // by webpacks internal loaders.
                test: [/\.ttf$/],
                options: {
                    name: 'static/media/[name].[hash:8].[ext]',
                },
            }
        ]
    });
    webpackConfig.plugins.unshift(   new MonacoWebpackPlugin({
        languages: ['javascript', 'html', 'json'],
        features: ['!gotoSymbol'],
    }),)
    return webpackConfig;
}
