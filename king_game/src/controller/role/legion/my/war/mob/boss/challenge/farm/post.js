
'use strict'

module.exports = exports = async function (ctx, next) {
	ctx.boss.totaldamage += ctx.myinfo.lastdamage * ctx.times;
	ctx.myinfo.totaldamage += ctx.myinfo.lastdamage * ctx.times;
}