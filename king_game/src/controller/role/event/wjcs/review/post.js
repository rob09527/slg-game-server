
'use strict'
// 武将重生-预览
module.exports = exports = async function (ctx, next) {
    let { index, guid } = ctx.request.body;
    index = parseInt(index);
    let { WJCS: config } = global.gameconfig.zhd;
    config = config[index];
    ctx.assert(config, 'invalid index');
    let {
        // 重生次数限制
        LIMIT,
        // 
        GSID,
        // 星级要求
        STAR: star,
        // 本体武将的GSID
        STAR5_SELFGSID: star5_selfgsid,
        // 武将阵营
        CAMP: camp
    } = config;
    let bought = ctx.role.wjcs[index] || 0;
    ctx.assert(bought < LIMIT, 'no more');
    // 判断玩家是否有这个guid
    let g = await ctx.dao.general.findOne({ _id: guid });
    ctx.assert(g, 'general nexist');
    ctx.assert(g.gsid == GSID, 'not satisfi')
    // 返还的材料
    let items = [].concat(g.material('DECOMP'));
    // 读配置表判断返还武将数量
    let {
        // 本体武将数量
        STAR5_SELF: star5_self,
        // 5星同阵营武将数量
        STAR5_RANK: star5_rank,
        // 6星同阵营武将数量
        STAR6_RANK: star6_rank,
        // 9星同阵营武将数量
        STAR9_RANK: star9_rank,
        // 10星同阵营武将数量
        STAR9_RANK: star10_rank
    } = global.gameconfig.generalbacknum[`STAR${star}`];
    // 组武将预览数据给客户端
    let general = [
        {
            gsid: star5_selfgsid,
            count: star5_self
        },
        {
            star: 5,
            count: star5_rank
        },
        {
            star: 6,
            count: star6_rank
        },
        {
            star: 9,
            count:star9_rank
        },
        {
            star: 10,
            count:star10_rank
        }
    ]
    ctx.body = {
        items,
        general
    };
}