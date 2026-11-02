"use strict"

module.exports = async function (ctx, next) {
    const { DAYMARK, BUYDAYMARK, DAYLIMIT: limit, PACK: { PRICE: price, REWARD: reward }, BOX } = ctx.config;
    const buyday = ctx.role.getProp(BUYDAYMARK);
    ctx.body = {
        buynum: limit - ctx.role.getProp(DAYMARK), // 今日可购买次数
        buyday, // 累计购买天数
        limit, // 每日礼包购买次数限制
        pack: {
            price,
            reward,
        },
        box: BOX.map(({ DAY: day, MARK, REWARD: reward }) => ({
            day,
            // 0-未达成 1-未领取 2-已领取
            status: buyday >= day ? (ctx.role.getProp(MARK) == 0 ? 1 : 2) : 0,
            reward,
        }))
    }
}