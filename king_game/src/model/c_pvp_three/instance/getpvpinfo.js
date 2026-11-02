const matchscore = require("./matchscore")


module.exports = exports = async (ctx, refresh) => {
    let result = await global.dao.c_pvp_three.findOne({ rid: ctx.role.rid })
    if (!result) {
        let theChallenged = await matchscore(1000, ctx)
        result = {
            rid: ctx.role.rid,
            score: 1000,
            theChallenged: theChallenged,
        }
        await global.dao.c_pvp_three.updateOne({ rid: ctx.role.rid }, result, { upsert: true })
    }
    if (refresh && result) {
        let theChallenged = await matchscore(result.score, ctx)
        result.theChallenged = theChallenged
        await global.dao.c_pvp_three.updateOne({ rid: ctx.role.rid }, result)
    }
    return result
}


