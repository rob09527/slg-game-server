
'use strict'
const moment = require('moment');
// 武将重生-确定
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
    let logs = {};
    // 判断玩家是否有这个guid
    let g = await ctx.dao.general.findOne({ _id: guid });
    ctx.assert(g, 'general nexist');
    ctx.assert(g.gsid == GSID, 'not satisfi');
    // 保存日志
    logs[guid] = [g.gsid, g.level, g.class];
    // 返还的材料
    let items = [].concat(g.material('DECOMP'));
    // 读返还武将数量配置表判断返还武将数量
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
        STAR10_RANK: star10_rank
    } = global.gameconfig.generalbacknum[`STAR${star}`];
    // 读返还武将配置表,筛选出本阵营的武将
    let generalbackList = global.gameconfig.generalback.filter((general) => {
        return general.CAMP == camp;
    });
    // 筛选5星的随机武将
    let start5general = generalbackList.filter((general) => {
        return general.STAR == 5;
    });
    ctx.assert(start5general.length > 0, 's5conf err');
    for (let i = 0; i < star5_rank; i++) {
        let item = start5general[ctx.random.between(0, start5general.length - 1)];
        ctx.assert(item, 's5invalid index');
        items.push({ GSID: item.GSID, COUNT: 1, dontmark: 1 });
    }
    // 6星的随机武将
    let start6general = generalbackList.filter((general) => {
        return general.STAR == 6;
    })
    ctx.assert(start6general.length > 0, 's6conf err');
    for (let i = 0; i < star6_rank; i++) {
        let item = start6general[ctx.random.between(0, start6general.length - 1)];
        ctx.assert(item, 's6invalid index');
        items.push({ GSID: item.GSID, COUNT: 1, dontmark: 1 });
    }
    // 9星的随机武将
    let start9general = generalbackList.filter((general) => {
        return general.STAR == 9;
    })
    ctx.assert(start9general.length > 0, 's9conf err');
    for (let i = 0; i < star9_rank; i++) {
        let item = start9general[ctx.random.between(0, start9general.length - 1)];
        ctx.assert(item, 's9invalid index');
        items.push({ GSID: item.GSID, COUNT: 1, dontmark: 1 });
    }

     // 10星的随机武将
     let start10general = generalbackList.filter((general) => {
        return general.STAR == 10;
    })
    ctx.assert(start10general.length > 0, 's10conf err');
    for (let i = 0; i < star10_rank; i++) {
        let item = start10general[ctx.random.between(0, start10general.length - 1)];
        ctx.assert(item, 's10invalid index');
        items.push({ GSID: item.GSID, COUNT: 1, dontmark: 1 });
    }

    // 本体武将增加
    // 公共方法暂不接受武将GSID使用COUNT
    for (let i = 0; i < star5_self; i++) {
        items.push({ GSID: star5_selfgsid, COUNT: 1, dontmark: 1 });
    }
    // 此处先添加物品保存人物信息,保证包裹空间足够
    // 增加物品增加
    ctx.role.addItemsNoSave(items);
    ctx.role.wjcs[index] = ++bought;
    ctx.role.markModified('wjcs');
    await ctx.role.save();
    // 移除重生的武将
    await ctx.dao.general.remove({ _id: guid });
    ctx.body = {
        items
    };
    // 日志打印
    if (logs[guid]) {
        let time = moment().format('YYYY-MM-DD HH:mm:ss');
        let [gsid, level, _class] = logs[guid];
        console.log('GENERAL', 'DECOMP', ctx.role.uid, guid, gsid, _class, level, time);
    }
}