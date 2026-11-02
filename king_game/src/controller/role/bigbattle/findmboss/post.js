
'use strict'

module.exports = exports = async (ctx, next) =>{
    let records = await ctx.dao.mboss.find({rid: ctx.role._id});
    let obj = {};
    const bossmonthly = global.gameconfig.bossmonthly;
    records.forEach(({index,subindex})=>{
        obj[index] = bossmonthly[index][0][subindex] == undefined;
    })
    ctx.body = {info:obj}
}