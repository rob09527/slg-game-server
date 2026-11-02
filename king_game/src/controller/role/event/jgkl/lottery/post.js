
'use strict'

// 夺宝活动-机关傀儡抽奖
module.exports = exports = async function (ctx, next) {
    const { type = 1 } = ctx.request.body;
    const { TYPE0: type0, TYPE1: type1, COST: cost, GIVES: gives } = global.gameconfig.zhd.JGKL;
    ctx.assert(type0 && type1, 'invalid config');
    // 查自身是否有选择稀有奖励
    let jgkl = ctx.role.jgkl || { gsid: 0 };
    ctx.assert(jgkl.gsid > 0, 'need select');
    // 找出稀有奖励的概率
    let info = type1.find(data => data.GSID == jgkl.gsid);
    ctx.assert(info, 'invalid config');
    // 扣费
    let cast = cost.find(data => data.TIMES == type);
    ctx.assert(cast, 'no cost type');
    ctx.role.castItemsNoSave({ gsid: cast.GSID, count: cast.COUNT });
    // 放入一个池子
    const configs = [...type0, info];
    let rate = configs.deepMap('CHANCE');
    let items = [];
    for (let i = 0; i < type; i++) {
        // 抽奖
        let info = configs[ctx.random.inweight(rate)];
        items.push({ gsid: info.GSID, count: info.COUNT })
    }

    // 根据抽奖次数放入对应数量的铜币
    let arr = gives.map(data => {
        return {
            gsid: data.GSID,
            count: data.COUNT * type
        }
    });
    ctx.zhdpoint("DBRW", ctx.role, 90589); // 夺宝任务-日常 （ 机关傀儡埋点
    items = [...items, ...arr];
    items = items.arrange();
    ctx.role.addItemsNoSave(items);
    await ctx.role.save();
    ctx.body = items;
}
