'use strict'

module.exports = exports = async (ctx) =>{
    let {index} = ctx.request.body;
    let config = global.gameconfig.vipzsyb;
    ctx.assert(config,'config error');
    let info = config[index];
    ctx.assert(info,'info error');
    ctx.assert(!ctx.role.getProp(info.REMARK),'already took');
    ctx.assert(ctx.role.vip >= info.VIP,'Not enough vip level');
    ctx.body = {reward:[...info.REWARD]};

    ctx.role.addItemsNoSave([...info.REWARD,{GSID:info.REMARK, COUNT:1}]);
    ctx.role.castItemsNoSave({GSID:info.GSID, COUNT:info.COUNT});
    await ctx.role.save();
}