
'use strict'

const RANGE_LIST = [
	// 积分范围
	{range: {$gte: 0.9}, key: 'pvpmultiscore'},
	{range: {$gte: 0.8, $lte: 1.2}, key: 'pvpmultiscore'},
	// 战力范围
	{range: {$gte: 0.5, $lte: 0.9}, key: 'others.90394.count'},
]

const mongoose = require('mongoose');
// todo 使用二分法查找战力匹配的机器人

module.exports = exports = async (ctx, next) =>{
	if (ctx.cache && !ctx.request.body.force) {
		ctx.body = ctx.cache.targets;
		return;
	}
	if (!ctx.cache) {
		// 默认1000积分
		if (!ctx.role.pvpmultiscore) {
			await ctx.role.updateOne({$set: {pvpmultiscore: 1000}});
			ctx.role.pvpmultiscore = 1000;
		}
		ctx.cache = new ctx.dao.c_pvpmulti({rid: ctx.role._id});
	}
	ctx.body = [];
	for (let i = 0; i < 3; i++) {
		let $nin = [ctx.role.i()];
		let exclude_role_list = ctx.body.filter(rid => !rid.startsWith('robot'));
		$nin.push(...exclude_role_list);
		$nin = $nin.map(rid => new mongoose.Types.ObjectId(rid));
		let target_list = [];
		let {
			range: {
				$gte,
				$lte,
			},
			key,
		} = RANGE_LIST[i];
		let cond = {
			pvpmultiscore: {$exists: 1},
			_id: {$nin},
		}
		let val = ctx.role.get(key);
		// 指定范围内
		if (target_list.length < 1) {
			cond[key] = {}
			if ($gte) cond[key].$gte = Math.trunc($gte * val);
			if ($lte) cond[key].$lte = Math.trunc($lte * val);
			target_list = await ctx.dao.role.find(cond, 'uid');
			target_list = target_list.map(doc => doc.i());
		}
		// 范围外
		if (target_list.length < 1) {
			cond.$or = [];
			if ($gte) cond.$or.push({[key]: {$lt: Math.trunc($gte * val)}});
			if ($lte) cond.$or.push({[key]: {$gt: Math.trunc($lte * val)}});
			target_list = await ctx.dao.role.find(cond, 'uid');
			target_list = target_list.map(doc => doc.i());
		}
		// 机器人
		if (target_list.length < 1) {
			let robot_in_list = ctx.body.filter(rid => rid.startsWith('robot')).map(id => Number.parseInt(id.slice(6)));
			let list = global.gameconfig.robotmpvp
				// 过滤已经选中的机器人
				.filter(robot => !robot_in_list.includes(robot.ID))
				.map(robot => ({id: robot.ID, power: robot.POWER}))
			let role = {
				id: 'role',
				power: ctx.role.getItems(90394).count,
			}
			list.push(role);
			list.sort(function (pre, next) {
				if (pre.power > next.power) return 1;
				if (pre.power < next.power) return -1;
				return 0;
			})
			let index = list.indexOf(role);
			let robotid = [list[index - 1], list[index + 1]].filter(robot => !!robot).map(robot => robot.id)[0];
			target_list.push('robot_'+robotid);
		}
		let target = target_list[ctx.random.between(0, target_list.length - 1)];
		ctx.assert(target, 'invalid target');
		ctx.body.push(target);
	}
	ctx.cache.targets = ctx.body;
	ctx.cache.markModified('targets');
	await ctx.cache.save();
}