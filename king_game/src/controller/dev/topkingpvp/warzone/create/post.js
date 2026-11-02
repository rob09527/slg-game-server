
'use strict'

const { curl } = require('urllib');
// 设置巅峰赛战区的服务器
module.exports = exports = async (ctx, next) => {
    let {
        areamark,
        servid = [] // 服务器列表
    } = ctx.request.body;

    if (areamark) {
        ctx.topkinggroup = await ctx.dao.topkingservergroup.findOne({ areamark });
    }
    // 新服务器进入,创建新组
    if (!ctx.topkinggroup) ctx.topkinggroup = await ctx.dao.topkingservergroup.create({ servid: servid[0] });

    if (ctx.topkinggroup) {
        // 取出areamark
        for (let sid of servid) {
            await ctx.dao.topkingservergroup.create({ servid: sid, areamark: ctx.topkinggroup.areamark })
        }
    }
    ctx.body = {};

}
