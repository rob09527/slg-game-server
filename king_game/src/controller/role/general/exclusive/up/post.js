'use strict'

// 武将专属升级
module.exports = exports = async (ctx, next) => {

    ctx.assert(!ctx.general.inherit || !ctx.general.inherit.prop || !ctx.general.inherit.prop.includes('level'), 'exclusive lock'); //  继承，则不能操作

    const current = ctx.general.exclusive_equip || 0;

    const gconfig = global.gameconfig.general[ctx.general.gsid];
    const TGRADE = gconfig.TGRADE;
    const consumeConfig = global.gameconfig.generals_exclusive.CONSUME[TGRADE];

    ctx.assert( consumeConfig && consumeConfig[current], 'exclusive max');
    const castitems = [...consumeConfig[current]];
    ctx.role.castItemsNoSave(castitems); // 扣除消耗品

    ctx.general.exclusive_equip = current + 1;

    // 为了触发推荐礼包，武将专属升级
    ctx.role[`EXCLUSIVE_UP_${ctx.general.exclusive_equip}`] = ctx.general.exclusive_equip;
    
    ctx.body = {
        general: ctx.general.base(),
        castitems: castitems
    };
}
