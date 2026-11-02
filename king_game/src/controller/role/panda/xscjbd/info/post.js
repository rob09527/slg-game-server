"use strict"

const moment = require("moment");

module.exports = async function(ctx, next) {
    ctx.body = {
        S_GSID:ctx.config.S_GSID,
        TYPE:ctx.panda.arg
    }
}