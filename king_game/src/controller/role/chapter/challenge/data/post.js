
'use strict'

const path = require('path');

module.exports = exports = async (ctx) =>{
	const config = global.gameconfig.battlechapter;
	const challengefactor = global.gameconfig.challengefactor;
	let chapterConfig = global.gameconfig.chapter[ctx.role.maxmapid];
	ctx.assert(config, 'config nexist');
	ctx.assert(challengefactor,'challengefactor config err');
	ctx.assert(chapterConfig,'chapterConfig err')
	let chapter = config[ctx.role.maxmapid]
	ctx.assert(chapter, 'not open');
	// 多返回一个等级战斗因子的数值
	let levelfactor = 0;
	if (chapterConfig) {
		let lfactor = ctx.role.level - chapterConfig.LIMIT;
		lfactor = Math.min(lfactor,challengefactor.LEVEL.length-1);
		levelfactor = challengefactor.LEVEL[lfactor]
	}
	ctx.body = {
		chapter,
		levelfactor
	}
}