
'use strict'

module.exports = async ctx => {
    const lv = Math.floor(ctx.depot.exp / 100);
    ctx.assert(lv > 0, 'nenough exp');
    const exp = -100 * lv;
    let udp = {
        $inc: {
            lv,
            exp,
        }
    };
    await ctx.depot.updateOne(udp);
    ctx.depot.lv += lv;
    ctx.depot.exp += exp;
    await ctx.role.missionInvoke('ZHENBAO_DEPOTLVUP', lv) .save();
    const {
        lv: level,
        exp: nowexp,
        attr: prop,
    } = ctx.depot.info();
    ctx.body = {
        level,
        nowexp,
        prop,
    }
}