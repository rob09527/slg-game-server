'use strict'

module.exports = async function(ctx, next) {
    ctx.assert(ctx.record.refersh < ctx.config.REFERSH.length,'no times');
    let rates = ctx.config.DISCOUNT.filter(value=>ctx.role.vip >= value.VIPMIN && ctx.role.vip <= value.VIPMAX).deepMap('CHANCE');
    const getIndex = ctx.random.inweight(rates);
    let dis = ctx.config.DISCOUNT[getIndex];
    ctx.assert(dis,'no dis'+getIndex);
    ctx.record.luck = dis.LUCKYNUM;
    let cost = ctx.config.REFERSH[ctx.record.refersh];
    if (cost.COUNT) {
        ctx.role.castItemsNoSave({GSID:cost.GSID, COUNT:cost.COUNT});
    }
    ctx.record.refersh++;
    ctx.body = {luck:ctx.record.luck, refersh:ctx.record.refersh};
    ctx.save = true;
}