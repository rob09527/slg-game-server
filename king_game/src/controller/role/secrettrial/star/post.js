'use strict'
/**
 *  领取星数奖励
 * @param {*} ctx 
 * @param {*} next 
 */
module.exports = async (ctx, next) => {

    const { chapterid, index } = ctx.request.body;

    const { CHAPTER: chapters } = global.gameconfig.secrettrial_chapter;
    const chapterConf = chapters[chapterid];
    ctx.assert(chapterConf, 'config nexist');

    const boxConf = chapterConf.BOX[index];
    ctx.assert(boxConf, 'box config nexist')
    // 是否已经通过到此章节
    let chapterInfo = ctx.record.passchapter[chapterid];
    ctx.assert(chapterInfo, 'chapter not pass');

    // 是否已经领取过
    ctx.assert(chapterInfo.boxs[index] < 1, 'aldeay reward');
    // 统计章节总星级数
    let total = ctx.record.getchapterstar(chapterid);

    // 判断星级总数是否满足
    ctx.assert(total >= +boxConf.COND, 'star not enough');

    // 发奖
    let items = boxConf.REWARD.map(({ GSID: gsid, COUNT: count }) => ({ gsid, count }));
    ctx.role.addItemsNoSave(items);
    await ctx.role.save();
    // 更新数据
    let $set = {
        [`passchapter.${chapterid}.boxs.${index}`]: 1
    }
    await ctx.record.updateOne($set);

    ctx.body = { items };
}