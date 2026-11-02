'use strict'

module.exports = exports = async (ctx, next)=>{
    let {index} = ctx.request.body;
    let boxInfo = ctx.config.SCORE[index];
    ctx.assert(boxInfo, "invalid boxInfo");
    ctx.assert(ctx.role.getProp(boxInfo.SIGN) == 0, "already took");
    ctx.assert(ctx.role.getProp(ctx.config.SCORESIGN) >= boxInfo.SCORE, "can not take");
    let reward = [boxInfo.REWARD];
    ctx.role.addItemsNoSave([...reward, {GSID:boxInfo.SIGN, COUNT:1}]);
    let cost = [], score = 0;
    ctx.config.SCORE.forEach((value)=>{
        let COUNT = ctx.role.getProp(value.SIGN);
        if (COUNT) {
            cost.push({GSID:value.SIGN, COUNT});
            if (value.SCORE > score) {
                score = value.SCORE;
            }
        }
    });
    if (cost.length == ctx.config.SCORE.length) {
        ctx.role.castItemsNoSave([...cost, {GSID: ctx.config.SCORESIGN, COUNT:score}]);
    }
    ctx.body = {
        reward
    };
    await ctx.role.save();
}