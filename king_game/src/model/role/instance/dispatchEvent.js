'use strict'

const zhdpoint = require("../../../util/event/point");
const h5post = require("../../../util/h5post");

const moment = require('moment')
/**
 *  分解武将：EVENT_GENERAL_DECOMP
 *  装备合成：EVENT_EQUIP_COMP
 *  试炼塔挑战胜利：EVENT_TOWER
 *  每天第一次进入游戏 EVENT_LOGIN,
 *  挂机奖励    EVENT_REAP,
 *  酒馆招募    EVENT_ZM,
 *  点将       EVENT_DJ,
 *  征战胜利    EVENT_CHAPTER_UP,
 *  王者之塔+1  EVENT_TOWER
 *  职业塔     EVENT_OCCTOWER_
 *   EVENT_CHAPTER_UP
 EVENT_DAZHANYI
 EVENT_PVP_KING
 EVENT_MBOSS
 EVENT_CHAPTER_UP
 EVENT_DUNGEON
 EVENT_MAZE
 EVENT_PVP_SOLO
 EVENT_PVP_MULTI
 EVENT_ZM_
 EVENT_DJ_
 EVENT_PVP_TEAM
 EVENT_AFFAIR_
 EVENT_REAP
 *    ...
 * 业务事件分发
 * @param event {string}
 * @param count {number}
 * @param params {object} // 必须是一个对象，不能是字符串
 */
module.exports = async function (event, count = 1, params, es) {
    if (event.startsWith("EVENT_AFFAIR_")) {
        zhdpoint("DBRW", this, 90583, count); // 夺宝任务-完成个人悬赏
    }

    console.log('DISPATCH EVENT', event, new Date().format(), count, params);
    if (event === 'EVENT_LOGIN' || event === 'EVENT_OFFLINE') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // global.elastic.update
        // 如果是登录事件，每天只记录一次
        const queryLoginLog = async (createRank) => {
            const match = [
                {"term": {"rid": this._id.toString()}},
                {"term": {"type": 'event_login'}},
                {
                    "range": {
                        "create": createRank || {"gte": today}
                    }
                }
            ];

            const res = await global.elastic.search({
                index: global.config.ES.DEF_INDEX || 'king',
                type: 'event',
                body: {
                    query: {
                        "constant_score": {
                            "filter": {
                                "bool": {
                                    "must": match
                                }
                            }
                        }
                    },
                    size: 1
                }
            }).catch(e => null);
            const hasLoginLog = res && res.hits && res.hits.total.value; // 是否有登录日志

            // {
            //     "_index": "king",
            //     "_type": "event",
            //     "_id": "EDiU43sBB86AfqwVgVCB",
            //     "_score": 1,
            //     "_source": {
            //          "type": "EVENT_LOGIN",
            //         "count": 1,
            //         "rid": "6101222454098210647acf64",
            //         "servid": 9009,
            //         "info": {
            //                  "online_ms": 0,
            //                  "uid": "ak01",
            //                  "last_time": 1631610760728
            //              },
            //          "create": "2021-09-14T09:12:45.668Z"
            //      }
            // }
            // console.log('today, login times is', JSON.stringify(res, null, 2));
            return hasLoginLog ? res.hits.hits[0] : null;
        }


        let item = await queryLoginLog();
        const updateLoginLog = async (info, yesterdayLog) => {
            const o = yesterdayLog || item;
            await global.elastic.update({
                index: o._index,
                type: o._type,
                id: o._id,
                body: {
                    doc: {
                        info: info
                    }
                }
            }).catch(console.error);
        }

        const createLoginLog = async (info = {}, create) => {

            const r = await global.elastic.insertOne('event', {
                type: 'EVENT_LOGIN',
                count,
                rid: this._id.toString(),
                servid: this.servid,
                info: {
                    uid: this.uid,
                    last_time: info.last_time || Date.now(),
                    online_ms: info.online_ms || 0,
                    status: info.status == null ? 1 : info.status,
                },
                create: create || new Date()
            }).catch(console.error);
        }

        if (event === 'EVENT_LOGIN') {
            if (!item) {
                await createLoginLog();
                let data = {
                    type: 1,    //上线
                    login_time: Math.floor(Date.now()/1000)
                }; 
                h5post("loginpost", this, data, {});
                return; // 如果当天没有登录事件埋点，则进行 事件埋点逻辑
            }
            const doc = item._source;
            doc.info = doc.info || {uid: this.uid, last_time: Date.now()}; // 兼容老数据
            if (!doc.info.status) {
                doc.info.status = 1;
                doc.info.last_time = Date.now(); // 重复上线不更新last_time
            }
            await updateLoginLog({
                uid: doc.info.uid,
                online_ms: doc.info.online_ms || 0,
                last_time: doc.info.last_time,
                status: doc.info.status || 0, // 表示在线
            });
            let data = {
                type: 1,    //上线
                login_time: Math.floor(doc.info.last_time/1000)
            }; 
            h5post("loginpost", this, data, {});
        } else if (event === 'EVENT_OFFLINE') {
            if (!item) { // 当天没有登录日志，则表明是跨天在线
                // 查询昨天的日志
                const yesterday = moment();
                yesterday.add(-1, 'days');

                const yesterdayLog = await queryLoginLog({
                    gte: new Date(yesterday.startOf('days').valueOf()),
                    lte: new Date(yesterday.endOf('days').valueOf())
                });
                if (yesterdayLog) {
                    const yesterdayDoc = yesterdayLog._source;
                    yesterdayDoc.info = yesterdayDoc.info || {uid: this.uid, last_time: today.getTime()}; // 兼容老数据
                    let onlineTime = yesterdayDoc.info.online_ms || 0;
                    onlineTime += (today.getTime() - yesterdayDoc.info.last_time);
                    onlineTime = Math.max(yesterdayDoc.info.online_ms || 0, onlineTime);
                    await updateLoginLog({
                        uid: yesterdayDoc.info.uid,
                        online_ms: onlineTime,
                        last_time: yesterdayDoc.info.last_time,
                        status: 0
                    }, yesterdayLog);

                    let data = {
                        type: 2,    //下线
                        login_time: Math.floor(yesterdayDoc.info.last_time/1000)
                    }; 
                    h5post("loginpost", this, data, {});
                }

                await createLoginLog({
                    online_ms: Date.now() - today.getTime(),
                    last_time: Date.now(),
                    status: 0
                }, today); // 登录日志时间记录到今天0点, 并记录今天的在线日志

                let data = {
                    type: 1,    //上线
                    login_time: Math.floor(Date.now()/1000)
                }; 
                h5post("loginpost", this, data, {});
                return;
            }
            const doc = item._source;
            doc.info = doc.info || {uid: this.uid, last_time: Date.now}; // 兼容老数据
            let onlineTime = doc.info.online_ms || 0;
            onlineTime = onlineTime + (Date.now() - doc.info.last_time);

            let data = {
                type: 2,    //下线
                login_time: Math.floor(doc.info.last_time/1000)
            }; 
            h5post("loginpost", this, data, {});

            await updateLoginLog({
                uid: doc.info.uid,
                online_ms: onlineTime,
                last_time: Date.now(),
                status: 0
            })
        }
        return; // 不走后续默认事件的埋点逻辑
    }

    // 限时任务进度累加
    global.dao.timeplay.addProcess(this, event, count, params && params.ret).catch(console.error);

    // 事件保存使用 elastic
    if(es){
        global.elastic.insertOne('event', {
            type: event,
            count,
            rid: this._id.toString(),
            servid: this.servid,
            info: params || {},
            create: new Date()
        }).then().catch(console.error);
    }
}
