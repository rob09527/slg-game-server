'use strict'

const load_cache = require('../../../../remote/load_cache');
// 停服 操作
module.exports = exports = async function (ctx, next) {
    let {
        serv_list = [],
        maintain = false
    } = ctx.request.body;
    ctx.body = {};
    let r;
    if (maintain) {
        r = await ctx.dao.gameserver.updateMany({servid: {$in: serv_list}}, {$set: {status: 0}}).catch(console.warn.bind(this, 'UNIQUE MAINTAIN ERROR'));
    } else {
        r = await ctx.dao.gameserver.updateMany({servid: {$in: serv_list}}), {$set: {status: 1}};
    }
    load_cache("gameserver");
    return r;
}
