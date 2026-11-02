
'use strict'

const { curl } = require('urllib');
// 更新战区与服务器
module.exports = exports = async (ctx, next) => {
    let {
        areamark,
        servids = [] // 服务器列表
    } = ctx.request.body;

    const updateOne = async function(servid){
        let topserver = await ctx.dao.topkingservergroup.findOne({ servid });
        if (topserver) {
            // 更新
            topserver.areamark = areamark;
            await topserver.save();
        } else {
            // 创建
            await ctx.dao.topkingservergroup.create({ servid, areamark });
        }
    }

    for (let server of servids) {
        // 去common服设置服务器
        await updateOne(server);
    }

    ctx.body = {}
}
