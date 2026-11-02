'use strict'

module.exports = exports = async (ctx, next) =>{
    let reward = await ctx.dao.c_qxzlreward.find({rid: ctx.role.i(), state:0}).sort({create:-1}).limit(20);

    ctx.body = {
        reward
    }
}