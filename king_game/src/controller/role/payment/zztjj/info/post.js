/**
 * 周主题基(周活动签到)金获取信息
 */

'use strict'

module.exports = async function (ctx, next) {
    let {
        type
    } = ctx.request.body;

    let config = ctx.config;
    ctx.assert(config, 'invalid config');
    let obj = {
        price: config.PRICE,
        exp: config.EXP,
        items: config.ITEMS
    };
    let key = ctx.role.isXS(`xs_zztjj_${type}`) ? `zztjj_${type}`:`zztjj1_${type}`
    if(type == 'dj' || type == 'gz' ){
       key = `zztjj_${type}`;
    }
    // 计算能领取的次数
    let record = ctx.role[key] || {};
    let num = record.num || 0;
    let ispay = record.ispay || 0;
    let can_getnum = ctx.zzzjj_time + 1 - num;

    ctx.body = {
        config: obj,
        ispay,
        can_getnum:can_getnum < 0 ? 0:can_getnum
    }
}
