
'use strict'

module.exports = exports = async (ctx, next) => {
    ctx.hook.pre(EVENT_ENUM.FRIENDPVP);
    await next();
}
