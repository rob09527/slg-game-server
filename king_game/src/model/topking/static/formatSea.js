'use strict'


const ms = require('ms');


/**
 * 查海选赛记录
 * @return {Promise<*|*>}
 */
module.exports = async function (servid, uid, warzone) {

    let user = await global.dao.topking.findOne({ servid, uid }, { seanum: 1 });
    // 获取指定小组海选赛记录
    let seaInfo = await global.dao.topkingrecord.findOne({ format: "sea", areamark: warzone }, { record: 1, finish: 1 });
    let data = [];
    if (seaInfo) {
        // 有记录
        let seaList = seaInfo.record[user.seanum];
        if (seaList && seaList.length > 0) {
            for (let list of seaList) {
                // 如果list的uid 或者tuid等于玩家的uid,则取出来
                if (list.uid == uid || list.targeid == uid) {
                    // 玩家在左边
                    let obj = {
                        videoid: list.vedioid,
                        lscore: list.rscore,
                        rscore: list.tscore,
                        left: {
                            uid: list.uid,
                            servid: list.servid
                        },
                        right: {
                            uid: list.targeid,
                            servid: list.tservid
                        }
                    }
                    data.push(obj)
                }
            }
        }

    }
    return data;
}
