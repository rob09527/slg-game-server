'use strict'

const moment = require("moment");

module.exports = async (ctx, next) =>{
  ctx.assert(ctx.role.getProp(90222) > 0, 'not active');
  ctx.record = await ctx.dao.guanyu.findOne({rid: ctx.role._id});

  let {DAYS} = global.gameconfig.guanyu;
  if (!ctx.record) ctx.record = await ctx.dao.guanyu.create({rid: ctx.role._id, expireAt: moment().add(+DAYS,'d').valueOf()});
  
  let nowTime = Date.now();
  ctx.assert(nowTime < ctx.record.expireAt, 'active expired')
  // 尝试获取最高等级&星级的关羽
  let $in = ctx.dao.guanyu.gsidList();
	let cond = {
		rid: ctx.role.i(), 
		gsid: {$in},
	}
	let projection = {
		level: 1,
		gsid: 1,
	}
  let guanyu = await ctx.dao.general.find(cond, projection).sort({level: -1, gsid: -1}).limit(1);
  if (guanyu.length > 0) {
	  ctx.guanyu = guanyu[0];
	  ctx.record.level = ctx.guanyu.level;
	  await ctx.dao.guanyu.updateOne({rid: ctx.role._id}, {$set:{level: ctx.guanyu.level}});
  }
  else {
    // 后续关羽被分解或删除后，进度清零
    ctx.record.level = 0;
    await ctx.dao.guanyu.updateOne({rid: ctx.role._id}, {$set:{level: 0}});
  }
  await next()
}