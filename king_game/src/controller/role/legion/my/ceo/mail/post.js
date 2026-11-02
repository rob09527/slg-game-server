'use strict'

const {MAIL_INTERVAL} = global.gameconfig.others.LEGION;

module.exports = exports = async (ctx, next) => {
    const mute = await ctx.role.isMute();
    // 被禁言用户检查
    if (mute) return;
    ctx.assert(ctx.role.getProp(38004) >= 3, 'rank limit');
    const {title, content} = ctx.request.body;
    ctx.assert(Date.now() >= ctx.legion.lastmail + MAIL_INTERVAL, 'not cooldown');
    const mails = ctx.legion._members.map(function (m) {
        if (m.pos == 2) return;
        const cond = {rid: m.rid, title, content};
        const mail = new ctx.dao.mail(cond);
        mail.from.type = 'legion';
        return mail.save();
    })
    await Promise.all(mails);
    ctx.legion.lastmail = Date.now();
    await ctx.legion.save();
    ctx.body = {num: mails.length};
}
