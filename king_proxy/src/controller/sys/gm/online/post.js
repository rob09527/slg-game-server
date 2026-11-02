

module.exports = exports = async function (ctx, next) {
    let gameservs = Object.values(global.gameservs)
    let online = []
    let info = {
        h5: 0,
        android: 0,
        ios: 0,
        wechatgame: 0,
        other: 0,
    }
    await Promise.all(gameservs.map(async game => {
        const result = await game.remote.socketonline();
        for (let x in result) {
            for (v in result[x]) {
                info['h5'] += result[x][v]['h5']
                info['wechatgame'] += result[x][v]['wechatgame']
                info['ios'] += result[x][v]['ios']
                info['android'] += result[x][v]['android']
            }
        }
        online.push(result)
    }))
    ctx.body = { info, online };
}


