
'use strict'

const moment = require('moment');

module.exports = exports = async (ctx, next) => {
	const rids = ctx.legion._members.map(function (m) {
		return m.rid;
	})
	let print_log = [
		// prefix
		'LEGIONDESTORY',
		// 军团ID
		ctx.legion._id.toString(),
		// 军团所属服务器id
		ctx.legion.servid,
		// 军团名字
		ctx.legion.name,
		// 操作者服务器id
		ctx.role.servid,
		// 操作者uid
		ctx.role.uid,
		// 操作者名字
		ctx.role.name,
		// 操作时间
		moment().format('YYYY-MM-DD HH:mm:ss'),
	]
	const p = [
		ctx.dao.role.updateMany({ _id: { $in: rids } }, {
			$set:
				{ legion: null, legionName: null, lleft: 1, legionjointime: 0, 'others.90299': { count: 0 } }
		}), // 被解锁而无团，无需等待12小时
		ctx.dao.apply.remove({ type: 'legion', to: ctx.legion._id }),
		ctx.dao.lboss.remove({ legion: ctx.legion._id }),
		ctx.legion.remove(),
	]
	ctx.mygroup = await global.dao.legionwbossgroup.findOne({ servid: ctx.role.servid });
	if (ctx.mygroup) {
		// 移除军团redis排名
		let rankService = new global.services.RankService('legionwboss', ctx.mygroup.groupmark);
		await rankService.del(
			ctx.legion._id.toString()
		);
	}

	//移除军团挑战个人排名
	await global.services.RankService.clearPatten('legionwbossrole', ctx.legion._id.toString());

	await Promise.all(p);
	// 操作自己需要被锁定12小时不能入团
	if (ctx.role.getItems(90371).count < 1) {
		ctx.role.addItemsNoSave(90371);
	} else {
		ctx.role.lleft = Date.now();
	}
	await ctx.role.save();

	// todo
	// 军团解散 退出军团战的报名记录
	// await ctx.commonsend('/legionpvp/exit', {
	// 	servid: ctx.legion.servid,
	// 	legion: ctx.legion._id
	// });
	// 操作完成后打印日志
	console.log.apply(null, print_log);
	ctx.body = {};
}
