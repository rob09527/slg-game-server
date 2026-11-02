'use strict'
const tg = require('./../../../util/textgetter');
module.exports = exports = async (ctx, next) => {
    let { key, bundle, type } = ctx.request.body;

    async function _psend(fn, exid) {
        const r = await global.remote.proxy_cdkey(fn, key, ctx.role.uid, ctx.role.servid, ctx.role.rid, {
            bundle,
            channel: ctx.role.channel,
            level: ctx.role.level,
            exid
        });
        return r;
    }

    let { items, name, limit } = await _psend('verify');        // verify cdkey valid
    let use_times = ctx.role.cdkeys[name] || 0;
    ctx.assert(limit > use_times, 'no more');
    ctx.assert(items && items.length > 0, 'invalid items');
    await _psend('confirm');    // confirm
    ctx.role.cdkeys[name] = ++use_times;
    ctx.role.markModified('cdkeys.' + name)
    if (type == 1) {
        ctx.role.addItemsNoSave([{ GSID: 99067, COUNT: 1 }]);
    }

    await ctx.role.save();
    const mails = []
    mails.push({
        rid: ctx.role.rid,
        type: 2,
        title: tg("CDKEYT"),
        content: tg("CDKEYC"),
        reward: items,
    });
    await global.dao.mail.insertMany(mails);
    // ctx.body = items.map(({ GSID: gsid, COUNT: count }) => ({ gsid, count }));
    ctx.body = {
        items: items,
    };
}