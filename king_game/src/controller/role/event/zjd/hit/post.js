// 欢乐砸金蛋--砸金蛋
module.exports = async function (ctx, next) {
    let { index } = ctx.request.body;
    ctx.assert(index >= 0, 'invalid index');

    let jdList = ctx.role.zjd.jdList || [];
    let zjdInfo = jdList[index];
    ctx.assert(zjdInfo, 'has get');
    ctx.assert(zjdInfo.status == 1, 'not zjd status in gived');
    let { MARK_HAMMER: castItem,HAMMER_CAST_COUNT:castCount } = global.gameconfig.zhd.ZJD;
    ctx.assert(castItem, 'castItem config is not exists');
    ctx.assert(castCount, 'castCount cnfig is not exists');

    let hammerCount = ctx.role.getProp(castItem);
    ctx.assert(hammerCount >= castCount , 'hammer is not enough');
    
    let { REAWARD_ITEMS: awardItems } = global.gameconfig.zhd.ZJD;
    ctx.assert(awardItems && awardItems.length > 0, 'awardItems config is not exits');

    /**根据权重 随机来获得一个奖励 */
    const totalWeight = awardItems.reduce(function (pre, cur, index) {
        cur.startW = pre;
        return cur.endW = pre + cur.WEIGHT
    }, 0)
    let random = Math.floor(Math.random() * totalWeight);
    let awrdItem = awardItems.find(award => award.startW < random && award.endW >= random);
    ctx.assert(awrdItem, 'award production fail');

    ctx.role.castItemsNoSave([{
        GSID:castItem,
        COUNT:castCount
    }]);
    //生成奖励 此时还未领取
    zjdInfo.awardItems = [{GSID:awrdItem.GSID,COUNT:awrdItem.COUNT}];
    zjdInfo.status = 2;
    ctx.role.markModified('zjd');
    await ctx.role.save();
    ctx.zhdpoint("ZJD_RED", ctx.role);
    hammerCount = ctx.role.getProp(castItem);
    ctx.body = {
        index,
        zjdInfo,
        hammerCount
    }
}