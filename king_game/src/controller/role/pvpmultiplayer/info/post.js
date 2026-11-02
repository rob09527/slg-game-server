
'use strict'

const getpvpinfo = require("../../../../model/c_pvp_three/instance/getpvpinfo");



module.exports = exports = async (ctx, next) => {
    ctx.body = await getpvpinfo(ctx);
}
