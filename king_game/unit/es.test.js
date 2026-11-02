const moment = require('moment');
const cc = require("./loginlog.json");

module.exports = async () => {

    const cc = require('./loginlog.json');
    const queryLoginLog = async (rid, date) => {
        const match = [
            {"term": {"rid": rid}},
            {"term": {"type": 'event_login'}},
            {
                "range": {
                    "create": {
                        gte: new Date(date.startOf('days').valueOf()),
                        lte: new Date(date.endOf('days').valueOf())
                    }
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

    const updateLoginLog = async (info, yesterdayLog) => {
        const o = yesterdayLog;
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
    let total = Object.keys(cc).reduce((p, c) => p + cc[c].length, 0);
    let i = 0;
    for (const k in cc) {

        const items = cc[k];
        const date = moment('2021' + k, 'YYYYMMDD');

        for (const item of items) {
            i++;


            const roles = await global.dao.role.find({uid: item.uid}, {_id: 1}).limit(2);
            const log = ['current', i, '/', total, 'roles(' + roles.length + ')'];
            process.stdout.write(log.join(','));
            for (const role of roles) {
                const rid = role._id + '';
                // , s ? s._id : null
                const s = await queryLoginLog(rid, date);
                process.stdout.write(s ? s._id : 'null');
                if (s) {
                    await updateLoginLog({
                        uid: item.uid,
                        online_ms: +item.t,
                        last_time: Date.now()
                    }, s);
                    break;
                }

            }
            console.log('')
        }

    }

}
