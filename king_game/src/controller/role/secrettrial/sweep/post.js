'use strict'

/**
 *  天机试炼扫荡
 * @param {*} ctx 
 * @param {*} next 
 */
module.exports = async (ctx, next) => {

    const buyNum = ctx.role.get('special.tjsl');
    const freeNum = ctx.role.getProp(90618); // 天机试炼免费扫荡标记

    ctx.assert(freeNum < (1 + (buyNum > 0 ? 1 : 0)), 'count not enough');

    // 扫荡最大的通关章节
    const sweepChapterId = ctx.record.chapterid;
    const { CHAPTER } = global.gameconfig.secrettrial_chapter;
    ctx.assert(CHAPTER[sweepChapterId], 'chapter config nexist');
    const { SWEEP_REWARD: rwd } = CHAPTER[sweepChapterId];
    ctx.assert(rwd, 'sweep reward error');

    ctx.assert(rwd.length > 0, 'unable sweep chapter');

    let items = rwd.map(({ GSID: gsid, COUNT: count }) => ({ gsid, count }));

    // 发奖&&更新标记
    ctx.role.addItemsNoSave([...items, { gsid: 90618, count: 1 }]);

    // 保存
    await ctx.role.save();
    ctx.body = { items }
}