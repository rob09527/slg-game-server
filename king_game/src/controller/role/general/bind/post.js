'use strict';
/**
 * 灵魂武将 灵魂链接
 * @type {exports}
 */
module.exports = exports = async (ctx, next) => {

    if (ctx.body.castitems) {
        ctx.role.castItemsNoSave(ctx.body.castitems);
        await ctx.role.save();
    }
    ctx.general.markModified('inherit');

    if( ctx.IS_NEW_GENERAL_GENERAL) { // 如果是新武将活动的灵魂武将,绑定与解绑需要更新角色信息
        ctx.role.act.NEW_GENERAL.soul_guid =   ctx.general._bind ? ctx.general.guid() : null;
        ctx.role.markModified('act.NEW_GENERAL.soul_guid');
        await ctx.role.save();
    }
    await ctx.general.save();
};
