'use strict';
const upgrade = require('../post');
const { hitHere } = require("../../../../../util/weektarget");
module.exports = exports = async (ctx, next) => {
    const {levelTo = 300} = ctx.request.body;
    ctx.is_auto = true;
    const castitems = []
    let old_level = ctx.general.level;
    while (ctx.general.level < levelTo) {
        try {
            const items = await upgrade(ctx, next);
            if(!items){
                break;
            }
            castitems.push(...items);
        }catch (e){
            break;
        }
    }

    ctx.body = {
        castitems: castitems.arrange(),
        general: ctx.general.base()
    }
    ctx.role.missionInvoke('GENERAL_LV_HISTORY', ctx.general.level, ctx.general._id.toString());
    ctx.role.missionInvoke('GENERAL_LV_UP', ctx.general.level - old_level);
    // 七日目标-武将打到等级
    hitHere(ctx.role, 94200, ctx.general.level);
    // 百级关羽红点推送
    await ctx.zhdpoint('GENERA_LVUP', ctx.role, ctx.general.gsid, ctx.general.level, old_level);
    
    // 武将升星推送&开启活动
    await ctx.zhdpoint('GENERAL_STAR', ctx.role, ctx.general.level);
    await ctx.role.save();
};
