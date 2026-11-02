'use strict'

// 觉醒

module.exports = exports = async (ctx, next) => {

    const config  = global.gameconfig.petitem[ctx.pet.gsid];
    ctx.assert(after, 'config error');
    let after = config.AWAKE_AFTER;
	ctx.assert(after, 'awake error');
    let num = config.AWAKE_NUM || 0;
    const items = global.gameconfig.petawake[num];
    ctx.assert(items, 'cost error');
    const reason = {main: 'pet', sec: 'awake'};

    ctx.role.castItemsNoSave(items, reason);
    ctx.pet.gsid = after;

    ctx.body = {
        castitems: items,
        pet: ctx.pet.base()
    }
}
