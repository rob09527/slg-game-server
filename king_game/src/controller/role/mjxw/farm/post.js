
'use strict'

module.exports = exports = async (ctx, next) =>{
    let {MARK,LIMIT} = global.gameconfig.mjxwreward.START;
    ctx.assert(ctx.role.getProp(MARK) < LIMIT,"can not mopup")
    let info = ctx.config[ctx.role.getProp(ctx.storey) - 1];
    ctx.assert(info,'no info');
    let reward = [];
    info.forEach(({GSID, COUNT, RATE})=>{
        if (RATE == 100 || Math.random() * 100 <= RATE) {
            reward.push({GSID, COUNT});
        }
    })
    ctx.role.addItemsNoSave([...reward,{GSID:MARK,COUNT:1}]);
    await ctx.role.save();
    ctx.body = {reward, time:ctx.role.getProp(MARK)};
}