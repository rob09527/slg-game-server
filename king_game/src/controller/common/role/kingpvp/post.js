
'use strict'

module.exports = exports = async (ctx, next) =>{
	let {
		servid,
		uid,
	} = ctx.request.body;
	ctx.body = {};
	let role = await ctx.dao.pvpking.findOne({servid: servid, uid});
	ctx.assert(role,'invalid pvpking info');
	if (role.kingpvp) {
		let {
			star,
		} = role.kingpvp;
		ctx.body.star = star;
		ctx.body.stage = await role.stage();
		if (role.kingpvp.promotion) {
			ctx.body.promotion = role.kingpvp.promotion.map(r =>{
				return r? 'win': 'lose';
			})
		}
		// 请求历史排名
		let user = await ctx.dao.role.findOne({servid,uid},{act: 0, deviceid: 0, mood: 0, cdkeys: 0, special: 0, friends: 0})
		if (user.hstage) ctx.body.hstage = user.hstage;
		role.bsetpower = await user.getBattlePower('kingpvp');
		let legion = await ctx.dao.legion.findOne({_id: user.legion});
		if (legion) {
			role.legion = legion.name;
		}
		let tem = user.avatarInfo();
		role = {...role,...tem};
	}
	if (role.kpdj) {
		ctx.body.locate = role.kpdj.map(r =>{
			return r? 'win': 'lose';
		})
	}
}
