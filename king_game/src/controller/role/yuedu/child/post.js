'use strict'

const set = {
    1:'pvp',
    3:'affairs',
    4:'exped',
    5:'fuben',
};

module.exports = exports = async (ctx) =>{
    let {type, index} = ctx.request.body;
    let config = global.gameconfig['nactivity' + set[type]];
    ctx.assert(config,'config invaild');
    let info = config[index];
    ctx.assert(info, 'info error');
    let get = ctx.role.getProp(info.RMARK) <= 0 && ctx.role.getProp(info.PROCESS) >= info.NUM;
    ctx.assert(get,'can not get reward');
    ctx.role.addItemsNoSave([...info.ITEMS,{GSID:info.RMARK, COUNT:1}]);
    await ctx.role.save();
    ctx.body = info.ITEMS;
}