"use strict"

// 掷骰子
module.exports = async function (ctx, next) {
    const { HJYT: {
        RCOUNT, // 每圈点数
        COST,
        ITEMS,
        SPOTCH, // 点数权重
    } } = global.gameconfig.zhd;
    let { times } = ctx.request.body;
    times = Number.parseInt(times);
    let costItem = COST.find(({ TIEMS }) => TIEMS === times);
    ctx.assert(costItem, "invalid times");
    costItem = costItem.ITEM;
    ctx.assert(ctx.role.getProp(costItem.GSID) >= costItem.COUNT, `not enough ${costItem.GSID}`);
    let items = [];
    // 投掷后获得的点数组合
    let pos = [];
    ctx.hjyt.spot = ctx.hjyt.spot || 0;
    for (let i = 0; i < times; i++) {
        const rate = SPOTCH.deepMap("CHANCE");
        // 当前摇到的点数
        let dot = SPOTCH[ctx.random.inweight(rate)].NUM;
        pos.push(dot);
        ctx.hjyt.spot += dot;
        items.push(ITEMS[ctx.hjyt.spot % RCOUNT]);
    }
    ctx.role.hjyt = ctx.hjyt;
    ctx.role.markModified("hjyt");
    ctx.role.castItemsNoSave(costItem);
    ctx.role.addItemsNoSave(items);
    await ctx.role.save();
    // 宝箱长连接红点
    if (ctx.zhdpoint("HJYTBOXRED", ctx.role) > 0) {
        pushClient(ctx.role, { type: 'act', content: { "hjyt": 1 } });
    }
    ctx.body = {
        pos,
        items,
    };
}