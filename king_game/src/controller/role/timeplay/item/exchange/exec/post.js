'use strict';

module.exports = exports = async function (ctx, next) {
    const from = [].concat(ctx.exec_config.FROM);
    const to = [].concat(ctx.exec_config.TO);
    ctx.touched.exchange[ctx.exec_config.ID] = ctx.touched.exchange[ctx.exec_config.ID] || 0;
    ctx.assert(ctx.touched.exchange[ctx.exec_config.ID] < ctx.exec_config.LIMIT, 'times limit');
    ctx.role.castItemsNoSave(from);
    ctx.role.addItemsNoSave(to);

    ctx.touched.exchange[ctx.exec_config.ID]++;
    ctx.touched.markModified('exchange');
    await ctx.touched.save();
    await ctx.role.save();
    ctx.body = {
        items: to,
        castitems: from,
    };
};
