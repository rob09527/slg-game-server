"use strict"



module.exports = async function (ctx, next) {
    ctx.body = {
        config: global.gameconfig.ftmphb,
    }
    return;
}