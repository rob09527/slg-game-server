'use strict';

module.exports = exports = async function (ctx, next) {

    const cfg = ctx.liang_config;
    ctx.assert(!ctx.touched.liang[cfg.ID], 'have_to_receive');
    const start = ctx.touched.create;
    // 玩法开启后10分钟内不能使用
    ctx.assert(Date.now() - start > global.gameconfig.chapter_new_event.LIANG_DEF_TIME, 'time limit');
    const startDate = new Date(start);
    startDate.setHours(0, 0, 0, 0);
    const nowDate = new Date();
    nowDate.setHours(0, 0, 0, 0);
    const day = (nowDate - startDate) / (24 * 3600 * 1000);

    ctx.assert(day >= cfg.DAY - 1, 'no finished');

    const items = [].concat(cfg.REWARDS);
    ctx.role.addItemsNoSave(items);
    ctx.touched.liang[cfg.ID] = 1;
    ctx.touched.markModified('liang');
    await ctx.role.save();
    await ctx.touched.save();
    ctx.body = {
        items,
    };
};
