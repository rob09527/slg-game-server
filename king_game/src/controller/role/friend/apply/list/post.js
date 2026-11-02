
'use strict'
// 好友申请列表
module.exports = exports = async function (ctx, next) {
	// ctx.role
	// 删除超过24小时的数据
	// await ctx.dao.apply.deleteMany({type: 'friend', create: { $lte: Date.now() - 24 * 60 * 60 * 1000 } })	// move 2 schedule

	// 排序显示时间最先的50条数据
	let cond = {
		type: 'friend',
		to: ctx.role._id,
	}
	let select = {
		rid: 1,
		create: 1,
	}
	let limit = Date.now() - 24 * 60 * 60 * 1000;
	let needArr = await ctx.dao.apply.find(cond, select).sort({_id: -1});
	needArr = needArr.filter(apply =>{
		return apply.create > limit;
	}).slice(0, 50)

	// 找出客户端需要的数据
	let returnData = [];
	let user = {};

	const users = await ctx.dao.role.find({
		 _id:  {$in: needArr.map(a => a.rid)} 
	}, {
		_id: 1, iconid: 1, rname: 1,
		headid: 1, frameid: 1, update: 1,
		_power: 1, "hide.38001": 1, "hide.38003": 1,
	});
	const needMap = {};
	needArr.forEach(o => {
		needMap[o.rid] = o._id.toString();
	});

	for (let mogoUser of users) {
		// 查玩家的信息
		user = {id: needMap[mogoUser.i() ]};
		user.iconid = mogoUser.iconid;
		user.rname = mogoUser.rname;
		user.vip = mogoUser.vip;
		user.headid = mogoUser.headid;
		user.frameid = mogoUser.frameid,
		user.rid = mogoUser._id.toString();
		user.lasttime = mogoUser.update; // 最后在线时间戳
		user.power = mogoUser._power;
		user.level = mogoUser.level;// 玩家的level
		returnData.push(user);
	}
	ctx.body = returnData;

}
