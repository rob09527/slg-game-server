
'use strict'

module.exports = exports = async (ctx, next) =>{

	const cond = {rid: ctx.role._id};

	await ctx.dao.affairs.remove(cond);
	await ctx.dao.apply.remove(cond);
	await ctx.dao.c_chkkey.remove(cond);
	await ctx.dao.c_pvp.remove(cond);
	await ctx.dao.c_recruit.remove(cond);
	await ctx.dao.c_shop.remove(cond);
	await ctx.dao.c_spin.remove(cond);
	await ctx.dao.c_sppack.remove(cond);
	await ctx.dao.exped.remove(cond);
	await ctx.dao.fboss.remove(cond);
	await ctx.dao.fpoint.remove(cond);
	await ctx.dao.fquest.remove(cond);
	await ctx.dao.mail.remove(cond);
	await ctx.dao.mboss.remove(cond);
	await ctx.dao.spinrecord.remove(cond);
	await ctx.dao.video.remove(cond);
	await ctx.dao.token.remove(cond);
	// 清理试练塔记录
	await ctx.dao.tower.remove(cond);
	// 清理一骑当先记录
	ctx.dao.c_dginfo.remove(cond)
	ctx.dao.c_dgchapter.remove(cond)
	// 王者演武删除
	await ctx.dao.pvpking.deleteOne({rid: ctx.role.i()});

	// 军团关系
	if (ctx.role.legion) {
		const legion = await ctx.dao.legion.findOne({_id: ctx.role.legion});
		if (legion) {
			const self = legion._members.deepQueryOne('rid', ctx.role.i());
			if (self) {
				legion._members.remove(self);
				legion.power -= ctx.role._power;
				legion.markModified('_members');
				await legion.save();
			}
		}
	}
	// 好友关系
	const friends = ctx.role.friends;
	for (const rid of friends) {
		let role = await ctx.dao.role.findOne({_id: rid});
		if (!role) continue;
		if (role.friends.includes(ctx.role.i())) {
			role.friends.remove(ctx.role.i());
			role.markModified('friends');
			await role.save();
		}
	}
	// 武将相关
	const generals = await ctx.dao.general.find(cond).hint({rid:1});
	for (const g of generals) {
		await ctx.dao.c_excuattr.remove({general: g._id});
	}
	// 武门丰碑删除
	const rankmissionList = await ctx.dao.rankmission.find({},{type:1,missionIndex:1,roles:1});
	let rankList = [];
	for (let {type,missionIndex,roles} of rankmissionList) {
			let newrole = [];
			for (let role of roles) {
				if (role.rid != ctx.role._id) newrole.push(role);
			};
			let info = ctx.dao.rankmission.updateOne({type,missionIndex},{roles:newrole});
			rankList.push(info);
	};
	await Promise.all(rankList);

	await ctx.dao.general.remove(cond);
	ctx.role.remove();
	ctx.body = {};
}
