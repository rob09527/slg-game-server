
'use strict'

/**
 *  天机试炼
 * @param {*} ctx 
 * @param {*} next 
 */
module.exports = async (ctx, next) => {
    // 是否解锁功能
    ctx.hook.pre(EVENT_ENUM.SECRET_TRIAL);

    const uidStr = ctx.role.i();
    ctx.record = await global.dao.secrettrial.findOne({ rid: uidStr, type: 'shilian' });
    if (!ctx.record) {
        ctx.record = await global.dao.secrettrial.unlockchapter(uidStr);
    }

    await next();
}