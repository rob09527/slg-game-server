
'use strict'

module.exports = exports = async (ctx, next) =>{
	// 判断军团秘境值开启时间
	ctx.assert(ctx.legion.secretplace > 0,'lboss lv no allow');
	// 神将试炼跨服组使用巅峰演武跨服组
	ctx.mygroup = await global.dao.legionwbossgroup.findOne({servid: ctx.role.servid});
	// 新服务器进入,创建新组
	if (!ctx.mygroup) ctx.mygroup = await ctx.dao.legionwbossgroup.create({servid: ctx.role.servid});
	ctx.groupmark = ctx.mygroup ? ctx.mygroup.groupmark : ctx.legion.servid;

	ctx.legionwbossRank = new global.services.RankService('legionwboss', ctx.groupmark); // 军团排行
	ctx.legionwbossRoleRank = new global.services.RankService('legionwbossrole', ctx.legion._id.toString()); // 个人排行
	await next();
}
