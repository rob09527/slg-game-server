'use strict'

module.exports = exports = async (ctx, next) =>{
    let { mapid, type } = ctx.request.body;
    let error = {ok:true, msg:''};
    if (type > 2) {
        error.ok = false;
        error.msg = '112';
    }
    else if (mapid >= ctx.qxzl.pos) {
        error.ok = false;
        error.msg = '104';
    }
    else if (ctx.qxzl.val <= 0) {
        error.ok = false;
        error.msg = '113';
    }
    else if (type == 2 && !ctx.config.MOPUP[mapid]) {
        error.ok = false;
        error.msg = '114';
    }
    else if (type == 1 && !ctx.config.REWARD[mapid]) {
        error.ok = false;
        error.msg = '115';
    }
    ctx.assert(error.ok, error.msg);
    ctx.qxzl.val--;
    await ctx.qxzl.save();
    ctx.body = {
        reward : [],
    }
    if (type == 2) {
        ctx.body.reward = ctx.config.MOPUP[mapid];
    }
    else {
        ctx.config.REWARD[mapid].forEach(({GSID, COUNT, RATE})=>{
            if (RATE == 100 || Math.random() * 100 <= RATE) {
                ctx.body.reward.push({GSID, COUNT});
            }
        });
    }
    ctx.role.addItemsNoSave(ctx.body.reward);
    await ctx.role.save()
}