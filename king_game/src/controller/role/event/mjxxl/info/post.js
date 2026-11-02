'use strict'

module.exports = exports = async (ctx) => {
    let act = global.ACTIVITY['mjxxl']
    let client_xxl = ctx.gameCache.mjxxl
    client_xxl.etime = act.etime
    ctx.body = { state: "success", client_xxl }
}
