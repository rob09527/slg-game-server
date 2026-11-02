

module.exports = exports = async function () {
    let gameservs = Object.values(global.gameservs)
    let online = []
    await Promise.all(gameservs.map(async game => {
        const result = await game.remote.socketonline();
        online.push(result)
    }))
    return online
}


