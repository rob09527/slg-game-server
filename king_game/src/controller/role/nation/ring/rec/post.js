'use strict';

/*
* 国战擂台 领取荣誉值
* */
module.exports = exports = async (ctx, next) => {
    const rid = ctx.role.i();
    const servid = ctx.role.servid;

    const owner = await ctx.dao.ringrank.findOne({rid: rid, 'role.servid': servid});
    ctx.assert(!owner.state, 'ring finished'); // 结束擂台挑战

    if (!owner){
        return ctx.body = {
            honor: 0,
            items:[]
        }
    }
    const honor = await owner.clearHonor();
    const items = [{
        GSID: 38018,
        COUNT: honor
    }];

    ctx.role.addItemsNoSave(items);
    await ctx.role.save();

    ctx.body = {
        items,
        honor
    }
};
