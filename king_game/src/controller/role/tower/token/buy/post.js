
'use strict'

const {
	MAX_TOKEN_NUM,
} = global.gameconfig.others.TOWER;

module.exports = exports = async (ctx, next) =>{
	let {
		num = 0,
	} = ctx.request.body;
	num = Number.parseInt(num);
	ctx.role.calTowerToken();
	let cur = ctx.role._towertoken.num;
	cur += num;
	ctx.assert(cur <= MAX_TOKEN_NUM, 'too much');
	ctx.role._towertoken.num = cur;
	ctx.role.castItemsNoSave({gsid: 38005, count: 10 * num}, 'tower');
	ctx.role.markModified('_towertoken');
	await ctx.role.save();
	ctx.body = ctx.role._towertoken;
}