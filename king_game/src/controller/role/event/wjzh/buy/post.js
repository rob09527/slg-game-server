
'use strict'
// 武将组合-点亮
module.exports = exports = async function (ctx, next) {
    let { index, guidList } = ctx.request.body;
    index = parseInt(index);
    let { WJZH: config } = global.gameconfig.zhd;
    config = config[index];
    ctx.assert(config, 'invalid index');
    let { LIMIT, CAST, ITEMS } = config;
    let bought = ctx.role.wjzh[index] || 0;
    ctx.assert(bought < LIMIT, 'no more');
    // 前端多传guid处理
    let blackboard = [];
    for (let guid of guidList) {
        let g = await ctx.dao.general.findOne({ _id: guid });
        for (let i = 0; i < CAST.length; i++) {
            let {GSIDS} = CAST[i];
            if (GSIDS.includes(g.gsid)) {
                blackboard[i] = blackboard[i] || [];
                blackboard[i].push(guid)
            }
        }
    }
    // 判断gsid是否是配置所需
    let is_satisfi = blackboard.every(function (guids, index) {
        let {COUNT} = CAST[index];
        return guids.length >= COUNT;
    })
    ctx.assert(is_satisfi, 'not satisfi');
    // 给奖励
    ctx.role.addItemsNoSave(ITEMS);
    ctx.role.wjzh[index] = ++bought;
    ctx.role.markModified('wjzh');
    await ctx.role.save();
    ctx.body = {
        reward: ITEMS
    };
}