
'use strict'
// 获取海选赛详细信息
module.exports = exports = async (ctx, next) => {

    let { warzone, rid } = ctx.request.body;
    ctx.assert(warzone, 'invalid warzone');
    ctx.assert(rid, 'invalid rid');
    let [uid, servid] = rid.split('|');

    const bindUserInfo = ctx.dao.topking.bindUserInfo;
    let data = await ctx.dao.topking.formatSea(servid,uid,warzone );
    if (data.length > 0) {
        // 跨服取出玩家信息
        for (let p of data) {
            let { left, right } = p;
            p.left = await bindUserInfo(left);
            p.right = await bindUserInfo(right);
        }
    }
    ctx.body = data
}
