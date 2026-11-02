
'use strict'

module.exports = async ctx => {
    let {
        zbid,
    } = ctx.request.body;
    // 判断已激活
    ctx.assert(!ctx.zhenbao, 'already active');
    // 判断id有效
    const config = global.gameconfig.zhenbao_item[zbid];
    ctx.assert(config, 'invalid zbid');
    // 固定消耗60个碎片
    ctx.role.castItemsNoSave({ gsid: config.PIECEID, count: 60 });
    await ctx.role.missionInvoke('ZHENBAO_ACTIVE')
        .save();
    // 增加一个珍宝
    const {
        zhenbao: new_zb,
    } = await ctx.depot.addZhenbaoOne({ zbid });
    const {
        slv,
        attr,
        skill,
    } = new_zb.info();
    ctx.body = {
        skill,
        level: slv,
        prop: attr,
    }
}