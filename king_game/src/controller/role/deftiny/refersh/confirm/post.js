
'use strict'

module.exports = exports = async function (ctx, next) {
    let { index } = ctx.request.body;
    let temprefersh = ctx.tian.temprefersh[index];
    let general = ctx.tian.general[index];
    ctx.assert(temprefersh && general,'no data');
    general.id = temprefersh;
    delete ctx.tian.temprefersh[index];
    ctx.role.markModified('destiny');
    ctx.body = ctx.tian.general;
}