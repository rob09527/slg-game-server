/**
 * 客户端存临时数据
 */

'use strict'

module.exports = exports = async (ctx, next) =>{
    let {data} = ctx.request.body;
    ctx.body = await ctx.dao.saveclientdata.create({rid:ctx.role.i(),data});
}
