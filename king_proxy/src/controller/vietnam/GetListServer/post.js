
module.exports = async (ctx, next) => {

    const list = global.CACHE.gameserver.list
    let server = []
    for (let x in list) {
        let data = {
            serverid: x,
            servername: list[x].name
        }
        server.push(data)
    }

    ctx.body = server
    return
}
