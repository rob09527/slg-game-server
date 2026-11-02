
'use strict'
// 武将皮肤-使用
module.exports = exports = async (ctx, next) => {

    let { skinid, guid } = ctx.request.body;
    ctx.assert(skinid, 'invalid skinid');
    ctx.assert(guid, 'invalid guid');
    // 判断是否到期,或者是否有这个皮肤,需要判断是否是默认皮肤
    let { TIMELIMIT: timelimit = -1, GENERAL_GSID: general_gsid } = global.gameconfig.generalskin[skinid];
    if (timelimit == -1 && !ctx.role._skins[skinid]) {
        // 永久但是没有激活,则直接使用
        ctx.role._skins[skinid] = -1;
        ctx.role.markModified('_skins');
    }
    // 找到最原始武将- 20星以上
    let gsid = parseInt(ctx.general.gsid) - parseInt((ctx.general.gsid) % 20) + 1
    // 判断这个skinid是否这个武将能穿
    ctx.assert(gsid === general_gsid, 'general use err');
    ctx.assert(timelimit == -1 || (timelimit != -1 && Date.now() < ctx.role._skins[skinid]), 'no time');
    // 往武将身上赋值
    ctx.general.skin = skinid;
}
