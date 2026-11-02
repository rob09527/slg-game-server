"use strict"

// 信息获取
module.exports = async function (ctx, next) {
    const { GIFTPACK, WELFARE, RECHARGE } = global.gameconfig.weektarget;
    let record = ctx.role.weektarget || {};
    let tutor = ctx.role.tutor || 1;
    const converter = list => list.map(({
        DATE: date, TAG: tag, INTRO: intro, LIMIT: limit, VIP: vip,
        REWARD, SPECLIST: speclist,
        COST: cost, PRICE,
        ARROCCU, // 导师奖励列表
    }, index) => {
        let result = {
            date, tag, intro, limit, vip, speclist,
        };
        if(ARROCCU) {
            result.reward = ARROCCU[tutor - 1]
        }else {
            result.reward = REWARD;
        }
        if (PRICE) {
            result.price = PRICE;
            result.buynum = record.gift ? (limit - (record.gift[index] || 0)) : limit;
        }
        else {
            result.cost = cost;
            result.buynum = record.wel ? (limit - (record.wel[index] || 0)) : limit;
        }
        return result;
    });
    ctx.body = {
        giftpack: converter(GIFTPACK),
        welfare: converter(WELFARE),
        recharge: RECHARGE,
    };
}