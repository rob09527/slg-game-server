
'use strict'

module.exports = exports = async function (ctx, next) {
    ctx.assert(ctx.role.getProp(ctx.config.COST.REWARDGSID) == 0,'already took');
    ctx.body = {reward:[...ctx.config.REWARD]};
    ctx.role.addItemsNoSave([...ctx.config.REWARD,{GSID:ctx.config.COST.REWARDGSID,COUNT:1}])
}