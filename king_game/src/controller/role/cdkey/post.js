'use strict'

module.exports = exports = async (ctx, next) => {
    let {key, bundle} = ctx.request.body;

    async function _psend(fn, exid) {
        const r = await global.remote.proxy_cdkey(fn, key, ctx.role.uid, ctx.role.servid, ctx.role.rid, {
            bundle,
            channel: ctx.role.channel,
            level: ctx.role.level,
            exid
        });
        return r;
    }

    let {items, name, limit} = await _psend('verify');	// verify cdkey valid
    let use_times = ctx.role.cdkeys[name] || 0;
    ctx.assert(limit > use_times, 'no more');
    ctx.assert(items && items.length > 0, 'invalid items');
    await _psend('confirm');	// confirm
    ctx.role.cdkeys[name] = ++use_times;
    ctx.role.markModified('cdkeys.' + name)
    ctx.role.addItemsNoSave(items);
    await ctx.role.save();
    ctx.body = items.map(({GSID: gsid, COUNT: count}) => ({gsid, count}));
}
