module.exports = async function (serverid, time) {
    const onlineReport = (await global.dao.onlineReport.find({ serverid, time: { $gte: time } }).sort({ time: -1 }).limit(100)).map(e => {
        let data = {
            serverid: e.serverid,
            channel: e.channel,
            ios: e.ios,
            android: e.android,
            h5: e.h5,
            wechatgame: e.wechatgame,
            time: e.time,
        }
        return data
    })
    return onlineReport
}