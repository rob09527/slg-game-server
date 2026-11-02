
'use strict'

module.exports = async ctx => {
    // ctx.zhenbao
    const config = global.gameconfig.zhenbao_str[ctx.zhenbao.zbId];
    // 是否有效ID
    ctx.assert(config, 'invalid zbid');
    // 是否最高等级
    ctx.assert(config[ctx.zhenbao.slv + 1], 'no more');
    // 碎片ID = 珍宝ID + 1000,策划徐剑锋说的
    const pieceid = ctx.zhenbao.zbId + 1000;
    ctx.role.castItemsNoSave({ gsid: pieceid, count: config[ctx.zhenbao.slv + 1].CAST });
    await ctx.role.save();
    // 加珍宝强化等级
    await ctx.zhenbao.updateOne({ $inc: { slv: 1 } });
    ctx.zhenbao.slv++;
    // 加珍宝库经验
    await ctx.depot.updateOne({ $inc: { exp: 25 } });
    ctx.depot.exp += 25;
    let {
        slv: level,
        attr: prop,
        skill,
    } = ctx.zhenbao.info();
    ctx.body = {
        jewel: {
            level,
            prop,
            skill,
        },
        exp: ctx.depot.exp,
    }
}