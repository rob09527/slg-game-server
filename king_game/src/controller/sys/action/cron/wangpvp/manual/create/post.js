
'use strict'
// 合服后,生成64位参赛选手
const moment = require('moment');
module.exports = exports = async function (ctx, next) {
    ctx.body = {};
    let { groupid } = ctx.request.body;
    ctx.assert(groupid >= 0, 'invalid groupid');
    // 做王战数据约束
    let c_wangpvps = await ctx.dao.wangpvp.find({ groupid });
    if (c_wangpvps.length > 0) {
        console.error('has wangpvp data');
        return
    }
    // 查玩家需要按照分组
    let g_servers = await ctx.dao.gameserver.fetchServerByGroupId(groupid);
    let roles = await ctx.dao.role.find({ servid: { $in: g_servers.group_sid_list }, 'battlearr.normal': { $exists: 1 } }, { '_id': 1 }).sort({ 'others.90185.count': -1 }).limit(64);
    let wangpvps = [];
    // 只取64人
    for (let i = 0; i < roles.length; i++) {
        let obj = {
            mark: i,
            rid: roles[i]._id.toString(),
            groupid
        }
        wangpvps.push(obj);
    };
    if (wangpvps.length > 0) await ctx.dao.wangpvp.insertMany(wangpvps);
}