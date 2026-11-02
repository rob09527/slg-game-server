
'use strict'

module.exports = exports = async function (ctx, next) {
	// ctx.body = {
	// 	dyup: true,	// 是否动更
	// 	fup: 'http://xxx.xxx.xxx/xxx.apk',	// 是否强制更新
	// };

	ctx.body = global.config.CLIENT_UDATE || {};
}