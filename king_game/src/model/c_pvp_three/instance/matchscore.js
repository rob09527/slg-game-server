const _ = require("lodash")

module.exports = exports = async (score, ctx) => {
    //0.8-1.4 浮动 随机取最大值
    let maxPercentage = 1.5
    let minPercentage = 0.7
    let maxScore = score * maxPercentage
    let minScore = score * minPercentage

    // for (let x = 1; x < 100; x++) {
    //     let sco = 700 + _.random(0, 900)
    //     let result = await global.dao.c_pvp_three.updateOne({ rid: x.toString() }, { score: sco, power: sco }, { upsert: true })
    // }

    let scorelist = await global.dao.c_pvp_three.find({ rid: { $ne: ctx.role.rid }, score: { $gte: minScore, $lte: maxScore } }).sort({ score: -1 }).limit(1000)
    scorelist = scorelist.map(it => {
        it = it.toObject();
        return it;
    });

    let challenged = []
    let sampledElements
    let robotrid = findrobot(score)
    if (scorelist.length >= 3) {
        sampledElements = _.sampleSize(scorelist, 3)
        sampledElements.forEach(e => {
            challenged.push(e.rid)
        })
    } else if (scorelist.length > 0) {
        sampledElements = _.sampleSize(scorelist, scorelist.length)
        sampledElements.forEach(e => {
            challenged.push(e.rid)
        })
        let cz = 3 - challenged.length
        for (let x = 0; x < cz; x++) {
            challenged.push(robotrid)
        }
    } else {
        challenged = [robotrid, robotrid, robotrid]
    }
    return challenged

}


function findrobot(score, ispower) {
    let minrobot_score = 0
    let maxrobot_score = 999999999999
    let minrobot
    let maxrobot
    for (let x in global.gameconfig.pvpmultiplayer.robot) {
        let result = global.gameconfig.pvpmultiplayer.robot[x][0]
        let key = 'L0'
        if (ispower) {
            key = 'POWER'
        }
        if (result[key] >= (minrobot_score) && result[key] <= score) {
            minrobot = result.ID
            minrobot_score = result[key]
        }
        if (result[key] <= (maxrobot_score) && result[key] >= score) {
            maxrobot = result.ID
            maxrobot_score = result[key]
        }
    }

    if (!minrobot && !maxrobot) {
        throw (`error config`)
    }
    return `robot_${maxrobot ? maxrobot : minrobot}`
}