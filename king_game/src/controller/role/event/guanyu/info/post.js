/**
 * 百级关羽活动信息获取
 */

'use strict'

const C_TYPE = [
	0,
	'special.gz',
	'special.zz',
]

module.exports = async ctx =>{
	ctx.body = {};
	ctx.body.nowlevel = ctx.record.level;
	if (ctx.guanyu) ctx.body.generalguid = ctx.guanyu._id.toString();
	let nextlevel = global.gameconfig.guanyu.REWARD[0].COND[0]; // 第一档等级作为初始值
	for (let {COND: [lv]} of global.gameconfig.guanyu.REWARD) {
		if (!ctx.body.nowlevel) break;
		nextlevel = lv;
		if (ctx.body.nowlevel < lv) break;
	}
	let data = await ctx.record.rewardstatus(ctx.role.get('special.gz'), ctx.role.get('special.zz'));
	ctx.body = {
		...ctx.body,
		nextlevel,
		data,
	}
}