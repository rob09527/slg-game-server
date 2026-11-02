
'use strict'

const { curl } = require('urllib');

module.exports = exports = async (ctx, next) => {
	let {
		uid,
	} = ctx.request.body;
	let role = await ctx.dao.role.findOne({ uid });
	ctx.assert(role, 'no role');
	// 删除周/月礼包缓存数据
	ctx.dao.c_sppack.deleteMany({ rid: role._id }).catch(console.error);
	// 军团关系
	if (role.legion) {
		const legion = await ctx.dao.legion.findOne({ _id: role.legion });
		if (legion) {
			const self = legion._members.deepQueryOne('rid', role.i());
			if (self) {
				legion._members.remove(self);
				legion.power -= role._power;
				legion.markModified('_members');
				await legion.save();
			}
		}
	}
	// 好友关系
	const friends = role.friends;
	for (const rid of friends) {
		let role = await ctx.dao.role.findOne({ _id: rid });
		if (!role) continue;
		if (role.friends.includes(role.i())) {
			role.friends.remove(role.i());
			role.markModified('friends');
			await role.save();
		}
	}
	// 跨服清理kingpvp
	// 清理试练塔记录
	ctx.dao.tower.remove({ rid: role._id }).catch(console.error);
	// 清理一骑当先记录
	ctx.dao.c_dginfo.remove({ rid: role._id }).catch(console.error);
	ctx.dao.c_dgchapter.remove({ rid: role._id }).catch(console.error);
	// 清理大战役
	ctx.dao.mboss.remove({ rid: role._id }).catch(console.error);

	const cond = {rid: role._id};
	await ctx.dao.affairs.remove(cond);
	await ctx.dao.apply.remove(cond);
	await ctx.dao.c_chkkey.remove(cond);
	await ctx.dao.c_pvp.remove(cond);
	await ctx.dao.c_recruit.remove(cond);
	await ctx.dao.c_shop.remove(cond);
	await ctx.dao.c_spin.remove(cond);
	await ctx.dao.fboss.remove(cond);
	await ctx.dao.fpoint.remove(cond);
	await ctx.dao.fquest.remove(cond);
	await ctx.dao.mail.remove(cond);
	await ctx.dao.spinrecord.remove(cond);
	await ctx.dao.video.remove(cond);
	await ctx.dao.token.remove(cond);
	// 武将相关
	const generals = await ctx.dao.general.find(cond);
	for (const g of generals) {
		await ctx.dao.c_excuattr.remove({general: g._id});
		//武将排行删除
		await ctx.dao.generalrank.remove({guid:g._id});
	}
	// 王者演武删除
	ctx.dao.pvpking.deleteOne({servid: role.servid, uid: role.uid})
	// 全服武将排行删除
	await ctx.dao.generalrank.deleteMany({ 'role.rid': ctx.role.i() });
	// 武门丰碑删除
	const rankmissionList = await ctx.dao.rankmission.find({}, { type: 1, missionIndex: 1, roles: 1 });
	let rankList = [];
	for (let { type, missionIndex, roles } of rankmissionList) {
		let newrole = [];
		for (let nrole of roles) {
			if (nrole.rid != role._id) newrole.push(nrole);
		};
		let info = ctx.dao.rankmission.updateOne({ type, missionIndex }, { $set:{'roles': newrole} });
		rankList.push(info);
	};
	await Promise.all(rankList);
	await ctx.dao.role.deleteOne({ uid }).catch(console.error);
	ctx.body = {}
}
