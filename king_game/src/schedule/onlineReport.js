'use strict'

exports.name = "在线报表";

exports.cron = "0,5,10,15,20,25,30,35,40,45,50,55 * * * ? ";

//exports.cron = "0/5 * * * * ?";
/**
 * @return {Promise<void>}
 */
exports.main = async function () {
    // const res = await global.remote.proxy_gameinstances();
    // const currentTime = Math.floor(Date.now() / 1000);

    // // 使用Map来保持数据的唯一性
    // const uniqueEntries = new Map();

    // res.games.forEach(game => {
    //     const gameOnline = game.online;
    //     for (const serverid in gameOnline) {
    //         for (const channel in gameOnline[serverid]) {
    //             const key = `${serverid}-${channel}`;
    //             const entry = { ...gameOnline[serverid][channel], serverid, channel, time: currentTime };

    //             // 构造Map的键，这里使用了JSON.stringify来确保键的唯一性
    //             const mapKey = JSON.stringify({ serverid, channel });

    //             // 如果键不存在，则添加新条目；如果存在，则合并条目
    //             if (!uniqueEntries.has(mapKey)) {
    //                 uniqueEntries.set(mapKey, entry);
    //             } else {
    //                 const existingEntry = uniqueEntries.get(mapKey);
    //                 existingEntry.h5 += entry.h5 || 0;
    //                 existingEntry.ios += entry.ios || 0;
    //                 existingEntry.wechatgame += entry.wechatgame || 0;
    //                 existingEntry.android += entry.android || 0;
    //             }
    //         }
    //     }
    // });

    // let insert = []
    // for (let x of uniqueEntries) {
    //     console.log(x)
    //     insert.push(x[1])
    // }


    // if (insert.length > 0) {
    //     // 插入数据到数据库
    //      await global.dao.onlineReport.insertMany(insert);
    // }
    await onlinesocketReport()
};


async function onlinesocketReport() {
    try {
        const currentTime = Math.floor(Date.now() / 1000);
        const res = await global.remote.proxy_gameonline();
        let info = {}
        res.map(e => {
            for (let servid in e) {
                for (let channel in e[servid]) {
                    if (!info[`${servid}-${channel}`]) {
                        info[`${servid}-${channel}`] = e[servid][channel]
                        info[`${servid}-${channel}`]['time'] = currentTime
                    } else {
                        info[`${servid}-${channel}`]['h5'] += e[servid][channel]['h5']
                        info[`${servid}-${channel}`]['ios'] += e[servid][channel]['ios']
                        info[`${servid}-${channel}`]['wechatgame'] += e[servid][channel]['wechatgame']
                        info[`${servid}-${channel}`]['android'] += e[servid][channel]['android']
                    }
                }
            }
        })
        let insert = []
        for (let x in info) {
            insert.push(info[x])
        }
        if (insert.length > 0) {
            // 插入数据到数据库
            await global.dao.onlineReport.insertMany(insert);
            console.log("定时器获取实时在线socket完成")
        }
    } catch (error) {
        console.error("定时器获取实时在线socket", error)
    }

}



/**
 * 结果检测函数 (可以不设置检测函数)
 * @return {Promise<boolean>}
 */
exports.check = async function () {
    return true;
}
