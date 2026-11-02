
const expireUserinfo = require("../../../../../../util/expireUserinfo");

module.exports = exports = async function (ctx, next) {

    const key = `${ctx.role._id.toString()}-prisoner`
    var cacheInfo = await expireUserinfo(key, true)

    cacheInfo.seat = ctx.role.seat
    ctx.body = cacheInfo
};


