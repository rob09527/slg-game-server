'use strict'

module.exports = exports = async (ctx) =>{
    let {index} = ctx.request.body;
    let config = global.gameconfig.factivity;
    ctx.assert(config,'config invaild');
    let info = config[index];
    ctx.assert(info, 'info error');
    ctx.assert(ctx.role.getProp(info.RMARK.N) <= 0, 'already get');
    const flag = info.CHK.every(item=>{
        if (typeof item !== 'object') item = {GSID: item, COUNT: 1};
        return ctx.role.getProp(item.GSID) >= item.COUNT;
    })
    ctx.assert(flag, 'can not get reward');

    ctx.body = [...info.ITEMS.N];
    ctx.role.special.yd && ctx.body.push(...info.ITEMS.S);
    ctx.role.addItemsNoSave([...ctx.body,{GSID:info.RMARK.N, COUNT:1},{GSID:info.RMARK.S, COUNT:ctx.role.special.yd?1:0}]);
    await ctx.role.save();
}