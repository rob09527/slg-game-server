const moment = require('moment');
const generalName = 'guanyu';
module.exports =  async (ctx, next) =>{
    ctx.record = await ctx.dao.generalstar.findOne({rid: ctx.role._id, gname: generalName});
    //console.log('<=generalstar rid=== ',ctx.role._id, generalName, ctx.record )
    if(!ctx.record){
      let {COND,DAYS} = global.gameconfig.generalstar;
      // 尝试获取最高等级的武将
      let $in = ctx.dao.general.getGsidsByParam({NAME: generalName});
      let cond = {
        rid: ctx.role.i(), 
        gsid: {$in},
      }
      let projection = {
        level: 1,
      }
      let generals = await ctx.dao.general.find(cond, projection).sort({level: -1}).hint({rid:1}).limit(1);
      ctx.assert(generals.length > 0, 'general not exist');
      ctx.assert(generals[0].level >= +COND, 'level not enough');

      ctx.record = await global.dao.generalstar.create({rid: ctx.role.i(), gname: generalName, expire: moment().add(+DAYS, 'd').valueOf()})
    }
    // 校验时间
    ctx.assert(Date.now() < ctx.record.expire, 'active expired')
    
    await next()
  }