
'use strict'

const getpvpinfo = require("../../../../../model/c_pvp_three/instance/getpvpinfo");

module.exports = exports = async (ctx, next) => {
    let {
        refresh
    } = ctx.request.body;
    let result = await getpvpinfo(ctx, true);
    let cache = result.theChallenged;
    let score = []
    await Promise.all(cache.map(async (target, index) => {
        let data = {}
        if (target.startsWith('robot')) {
            const robotid = parseInt(target.slice(6));
            const config = global.gameconfig.pvpmultiplayer.robot[robotid][0];
            data = {
                rid: cache[index],
                score: config.L0
            }
        } else {
            let result = await global.dao.c_pvp_three.findOne({ rid: target })
            data = {
                rid: cache[index],
                score: result.score
            }
        }
        score.push(data)

    }))
    ctx.body = score;
}
