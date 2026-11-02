'use strict';

const {
    MILITARY,
} = global.gameconfig.military_position || {};

/*
* 军衔升级
* */
module.exports = exports = async (ctx, next) => {

    const level = ctx.role.military_level;
    // 获取当前等级

    const militaryConfig = MILITARY[level];
    ctx.assert(militaryConfig, 'miss config');

    ctx.assert(MILITARY[level + 1], 'max level'); // 没有下一级了

    ctx.role.castItemsNoSave(militaryConfig.UPGRADE_CAST);
    const items = [...militaryConfig.UPGRADE_REWARDS, {GSID: 38021, COUNT: 1}];
    ctx.role.addItemsNoSave(items);
    await ctx.role.save();
    ctx.body = {
        level: ctx.role.military_level,
        castitems: militaryConfig.UPGRADE_CAST,
        items: items
    }
};
