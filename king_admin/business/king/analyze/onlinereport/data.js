const moment = require('moment');
exports.name = '在线详情查询';
exports.type = 'I';
exports.inherit = 'analyze-ltvmenus';
// 创建一个 看板数据的缓存区
global.BOARDH_CACHE = {};

exports.exec = async function (body, query, ctx) {
    const {
        _page_,
        _sort_,
        _export_,
        uid,
        pid,
        create,
        oid,

        today,
        ignore,
        ignore_old,
        type,
        state,
        packageid,
        ...othersOpt
    } = body;
    const { servid, bundle, date, platform } = body;

    let currentTime = Date.now()
    let currentTime_next = Date.now()
    if (date) {
        currentTime = Math.floor(new Date(date[0]).getTime() / 1000);
        currentTime_next = Math.floor(new Date(date[1]).getTime() / 1000);
    } else {
        currentTime -= 1000 * 60 * 60 * 6
    }
    const onlineModel = await this.service.game.collection('onlinereports');
    if (servid != "ALL") {
        const onlineCursor = await onlineModel.find({ serverid: String(servid), time: { $gte: currentTime, $lte: currentTime_next } }).sort({ time: -1 })
        const online = (await onlineCursor.toArray()).map(e => {
            let data = {
                serverid: e.serverid,
                channel: e.channel,
                ios: e.ios,
                android: e.android,
                h5: e.h5,
                wechatgame: e.wechatgame,
                time: new Date((e.time * 1000)),
                total: e.ios + e.android + e.h5
            }
            return data
        })
        return online
    } else {
        const onlineCursor = await onlineModel.find({ time: { $gte: currentTime, $lte: currentTime_next } }).sort({ time: -1 })
        let data = {
        }
        const online = (await onlineCursor.toArray()).map(e => {
            if (!data[e.time]) {
                data[e.time] = {
                    ios: Number(e.ios),
                    android: Number(e.android),
                    h5: Number(e.h5),
                    total: (Number(e.ios) + Number(e.android)) + Number(e.h5),
                    timescort: e.time,
                    time: new Date((e.time * 1000)).format()
                }
            } else {
                data[e.time]['ios'] += Number(e.ios)
                data[e.time]['android'] += Number(e.android)
                data[e.time]['h5'] += Number(e.h5)
                let sum = (Number(e.ios) + Number(e.android)) + Number(e.h5)
                data[e.time]['total'] += sum
            }
        })
        let list = []
        for (let x in data) {
            list.push(data[x])
        }
        list = list.sort((a, b) => {
            return b.timescort - a.timescort;
        });
        return list

    }




};

