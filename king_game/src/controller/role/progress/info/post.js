
'use strict'
// 安营扎寨接口信息
module.exports = exports = async function (ctx, next) {
    let yzzc = 0;
    // 查远征是否完成
    let unfinish_maze = await ctx.dao.mazechapter.find({ rid: ctx.role._id, finish: { $exists: 0 } });
    // 远征未解锁或者未开启,则为-1
    if (unfinish_maze.length == 0) {
        //查是否有数据
        let mazeInfo = await ctx.dao.mazechapter.find({ rid: ctx.role._id }, { rid: 1 });
        if (mazeInfo.length == 0) yzzc = -1;
    }

    // 日常战役 剩余挑战次数
    let lastarr = [];
    let marks = [90268, 90269, 90270];// 大战役免费挑战次数标记
    for (let i = 0; i < marks.length; i++) {
        lastarr.push(2 - ctx.role.getProp(marks[i]));
    }
    let dzy = lastarr.reduce((sum, cur) => sum + cur, 0);
    let xsl = 0;
    // 悬赏令
    let affairs = await ctx.dao.affairs.findOne({ rid: ctx.role._id });
    if (affairs) {
        // 不为空
        // 判断是否有等待派遣的任务。
        for (let mission of affairs.missions) {
            if (!mission.lock || Date.now() > mission.etime) {
                xsl = 1;
                break;
            }
        }
    }
    // 一骑当先
    let cond = {
        rid: ctx.role._id,
        // 尚未结束(没有结束标记)
        finish: { $exists: 0 }
    }
    let yjdx = 0;
    // 倒序
    let dungeon = await ctx.dao.c_dgchapter.find(cond);
    // 一骑当先未解锁或者未开启,则为-1
    if (dungeon.length == 0) {
        //查是否有数据
        let dungeonInfo = await ctx.dao.c_dgchapter.find({ rid: ctx.role._id }, { rid: 1 });
        if (dungeonInfo.length == 0) yjdx = -1;
    }
    ctx.body = {
        yzzc: yzzc ? yzzc : unfinish_maze.length,
        dzy,
        xsl: affairs ? xsl : -1,// 悬赏令为空,则未解锁
        yjdx: yjdx ? yjdx : dungeon.length
    }

}
