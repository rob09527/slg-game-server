
'use strict'

module.exports = exports = async (ctx, next) =>{
	ctx.hook.pre(EVENT_ENUM.MYTHICAL);
	ctx.mythic = ctx.role.mythical[ctx.request.body.mythic];
	if (!ctx.mythic) ctx.mythic = {level: 0, class: 1, pskill: [0, 0, 0, 0],talent:[],talentskill:[]};
	await next();
	ctx.role.mythical[ctx.request.body.mythic] = ctx.mythic;
	ctx.role.markModified('mythical');
	await ctx.role.save();
	// 计算指定神兽天赋,加成后的属性值
	let after_mythic = ctx.role.countOneMythicAttr(ctx.mythic);
	if (!ctx.body) ctx.body = after_mythic;
}
