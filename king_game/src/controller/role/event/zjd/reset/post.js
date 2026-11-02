// 欢乐砸金蛋--重置
module.exports = async function (ctx, next) {
    let { index } = ctx.request.body;
    ctx.assert(index >= 0, 'invalid index');

    let jdList = ctx.role.zjd.jdList || [];
    let zjdInfo = jdList[index];
    ctx.assert(zjdInfo, 'has get');
    ctx.assert(zjdInfo.status == 2, 'not zjd status in gived');
    zjdInfo.status = 1;
    zjdInfo.awardItems = [];
    ctx.role.markModified('zjd');
    await ctx.role.save();
    ctx.zhdpoint("ZJD_RED", ctx.role);
    ctx.body = {
        index,
        zjdInfo
    }
}