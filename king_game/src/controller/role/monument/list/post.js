
'use strict'

// 缓存超时时间
const CACHE_EXPIRED = 1000;
/*
  缓存防止并发,结构如下
  cache: {
	  wei: {
	    data: [...],
      time: 123124123234132,
	  },
	  ...
  }

 */
const CACHE_STROAGE = {}
// 武门丰碑排排行列表
module.exports = exports = async function (ctx, next) {
	let {
		monument,
	} = ctx.request.body;
	// 使用缓存
	const cache = CACHE_STROAGE[monument] || {time: -1};
	if (Date.now() - cache.time <= CACHE_EXPIRED) {
		ctx.body = cache.data;
		return;
	}
	// 获取数据
	let config = global.gameconfig.rankmission[monument];
	ctx.assert(config, 'invalid monument');
	config = config.map(async function(mission, index) {
		let cond = {
			type: monument,
			missionIndex: index,
			groupid: ctx.role._gameserv.groupid
		}
		let record = await ctx.dao.rankmission.findOne(cond, {roles: 1});
		if (!record) return [];
		record = record.roles.map(async function({rid, time}) {
			let select = {
				rno: 1, rname: 1, hide: 1,
				frameid: 1, headid: 1,
			}
			let role = await ctx.dao.role.findOne({_id: rid}, select);
			if (!role){
				return null;
			}
			return {
				id: role.i(),
				rname: role.name,
				frameid: role.frameid,
				headid: role.headid,
				level: role.level,
				time,
			}
		});
		return await Promise.all(record);
	})
	// 刷新缓存
	ctx.body = cache.data = await Promise.all(config);
	ctx.body = ctx.body.map(arr => arr.filter(Boolean));
	cache.time = Date.now();
	CACHE_STROAGE[monument] = cache;
}
