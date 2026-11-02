
'use strict'

module.exports = exports = async (ctx, next) => {
    const config = global.gameconfig.pvpmultiplayer
    let client = JSON.parse(JSON.stringify(config))
    client.splice(0, 1)
    delete client.robot
    ctx.body = client
}