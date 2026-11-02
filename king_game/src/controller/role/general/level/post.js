'use strict'

const initSecret = require("../../../../model/secretRealmRole/instance/initSecret");
const { hitHere } = require("../../../../util/weektarget");

const guanyu_id = [];

module.exports = exports = async (ctx, next) => {

    ctx.assert(!ctx.general.inherit || !ctx.general.inherit.prop || !ctx.general.inherit.prop.includes('level'), 'level lock'); //  继承，则不能操作

    let maxlv = global.gameconfig.generalclass[ctx.general.class].MAXLV;
    //
    // @author awko 新版本的升阶条件，只需要达到当前阶最高等级就自动升阶并升级

    const reason = { main: 'general', sec: 'level' };
    const items = [...(global.gameconfig.generallevel[ctx.general.level - 1] || [])];
    if (ctx.general.level >= maxlv) {
        // 升阶
        const nextclass = global.gameconfig.generalclass[ctx.general.class + 1];
        if (!nextclass) {
            // 已经达到顶阶
            let extlv = global.gameconfig.general[ctx.general.gsid].EXLV || 0;
            ctx.assert(ctx.general.level + 1 <= maxlv + extlv, 'max lv');
        } else {
            const config = global.gameconfig.general[ctx.general.gsid];

            await initSecret(ctx)
            //暂时关闭
            if (ctx.general.class >= config.MAXCLASS) {
                ctx.assert(config.MAXELFL <= ctx.secretRealmRole.spiritLevel, 'Elves do not meet the promotion criteria');
            }
            ctx.assert(ctx.general.class < config.MAXCLASS, 'max class');
            items.push(...nextclass.ITEMS);
            reason.sec = 'class';
        }
    }
    if (ctx.is_auto) { // 如果是 自动升级，需先判断消耗
        for (const item of items) {
            if (ctx.role.getProp(item.GSID) < item.COUNT) {
                return false;
            }
        }
    }
    ctx.role.castItemsNoSave(items, reason);
    if (reason.sec === 'class') {
        ctx.general.class++;
    }
    ctx.general.level++;

    if (ctx.is_auto) { // 自动升级时，直接返回消耗
        return items;
    }
    ctx.body = {
        castitems: items,
        general: ctx.general.base()
    }
    ctx.role.missionInvoke('GENERAL_LV_HISTORY', ctx.general.level, ctx.general._id.toString());
    ctx.role.missionInvoke('GENERAL_LV_UP', 1);
    // 七日目标-武将打到等级
    hitHere(ctx.role, 94200, ctx.general.level);
    // 百级关羽红点推送
    await ctx.zhdpoint('GENERA_LVUP', ctx.role, ctx.general.gsid, ctx.general.level, ctx.general.level - 1);

    // 武将升星推送&开启活动
    await ctx.zhdpoint('GENERAL_STAR', ctx.role, ctx.general.level);
    await ctx.role.save();
}


