
'use strict'
// 天工试炼信息查询
module.exports = exports = async function (ctx, next) {
    let { TGSL } = global.gameconfig.zhd
    ctx.body = {
        name: TGSL.NAME,
        gsid: TGSL.GSID,
        level: TGSL.LEVEL,
        skill: TGSL.SKILL,
        mark: TGSL.MARK,
        challrewards: Array.from(new Set(TGSL.REWARD
            .reduce((pre, next) => pre.concat(next))
            .map(x => x.GSID)
        )),
        bset: ctx.bset
    }
    // 周活动日志-天公试炼-信息获取
    ctx.zhdprint("tgsl_info");
}