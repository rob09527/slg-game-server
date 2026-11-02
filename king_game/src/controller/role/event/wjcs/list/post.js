
'use strict'

module.exports = exports = async function (ctx, next) {
    let { WJCS: config } = global.gameconfig.zhd;
    ctx.body = config.map(function ({ LIMIT, GSID: gsid, CAMP: camp, STAR5_SELFGSID: star5_selfgsid, STAR: star }, index) {
        return {
            gsid,
            limit: LIMIT,
            relivetimes: LIMIT - (ctx.role.wjcs[index] || 0),
            camp,
            star5_selfgsid,
            star
        }
    })
}