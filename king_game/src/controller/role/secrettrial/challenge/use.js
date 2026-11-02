
'use strict'

module.exports = exports = async (ctx, next) => {

    let { chapterid, levelid } = ctx.request.body;

    if (!chapterid) chapterid = ctx.record.chapterid;
    ctx.assert(ctx.record.passchapter[chapterid], 'chapter not unlock');

    // 查找bossid是否存在
    if (!levelid) levelid = ctx.record.levelid;

    const { CHAPTER: chapters } = global.gameconfig.secrettrial_chapter;
    ctx.chapterBossConf = null;
    chapters[chapterid].BOSS.map((elem, index) => {
        if (+elem.BOSSID == +levelid) {
            ctx.chapterBossConf = elem;
            ctx.chapterBossConf.levelIndex = index; // 当前关卡下标
        }
    })
    ctx.assert(ctx.chapterBossConf, 'levelid nexist');

    // 数据临时赋值
    ctx.chapterInfo = ctx.record.passchapter[chapterid];
    ctx.chapterInfo.stars.forEach(elem => {
        if (elem && elem.levelid === levelid) ctx.curLevelInfo = elem;
    });
    ctx.assert(ctx.curLevelInfo, 'levelid nexist');

    // 如果打的是新关卡，则校验每日首通关卡数量上限
    if (chapterid == ctx.record.chapterid && levelid == ctx.record.levelid && ctx.curLevelInfo.satisfy.length < 1) {
        ctx.assert(ctx.role.getProp(90619) < 15, 'unlock level limit');
    }

    let { STARCONDID: condIds } = ctx.chapterBossConf;
    ctx.assert(ctx.curLevelInfo.satisfy.length < condIds.length, 'level max star');

    // 未打过且通关后是否开启新章节
    if (ctx.curLevelInfo.satisfy.length < 1 && ctx.chapterBossConf.levelIndex + 1 >= chapters[chapterid].BOSS.length) {
        ctx.openNewChapter = true;
    }
    ctx.curChapterId = chapterid;
    ctx.curLevelId = levelid;
    await next()
}