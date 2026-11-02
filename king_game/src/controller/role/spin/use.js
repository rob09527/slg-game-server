
'use strict'

const TYPE_INDEX = ['normal', 'premium'];

module.exports = exports = async (ctx, next) =>{
	const num = parseInt(ctx.request.body.type) || 1;
	ctx.stype = TYPE_INDEX[num - 1];
	const eventname = ctx.stype === 'premium'? EVENT_ENUM.LOOKSTAR_PREMIUM: EVENT_ENUM.LOOKSTAR;
	ctx.hook.pre(eventname);
	ctx.cache = await ctx.dao.c_spin.findOne({rid: ctx.role._id, type: ctx.stype});
	await next();
	// 处理某些特殊情况导致的，观星重置失败补救措施
	let ok = 0;
	try {
		const rule = global.execrules['spinrset_1'];
		if(rule.FROM){
			for (let it of rule.FROM){
				ctx.assert(it.COUNT <= ctx.role.getProp(it.GSID), 'fail');
			}
		}
		ctx.khexec(ctx.role, 'spinrset_1', 1);
		ok++;
	}catch (e) {
	}
	try {
		const rule = global.execrules['spinrset_2'];
		if(rule.FROM){
			for (let it of rule.FROM){
				ctx.assert(it.COUNT <= ctx.role.getProp(it.GSID), 'fail');
			}
		}
		ctx.khexec(ctx.role, 'spinrset_2', 1);
		ok++;
	}catch (e) {
	}
	if (ok > 0){
		ctx.role.save().then();
	}
}
