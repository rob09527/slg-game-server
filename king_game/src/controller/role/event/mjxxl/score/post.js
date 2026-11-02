
module.exports = exports = async (ctx) => {
    const { score } = ctx.request.body
    let xxl = ctx.gameCache.mjxxl
    ctx.assert(xxl.frequency > 0, 'not enough times');
    ctx.gameCache.mjxxl.frequency -= 1
    ctx.gameCache.mjxxl.score += score
    ctx.body = { state: "success", client_xxl: ctx.gameCache.mjxxl }
}
