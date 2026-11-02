
'use strict'
const configitem = require('../util/configitem');
const tg = require('../util/textgetter');
exports.name = "小黄鱼消耗排行榜奖励邮箱结算"; // 每日定时器，负责执行 周 日 月标记刷新

// 定时器语句
exports.cron = "0 0 0 * * *";

exports.main = async function () {
    let result = await global.dao.activity.findOne({ type: "XHYXHB" })
    let id = "xhyxhb"
    let sysconfig = global.gameconfig[id][0]
    let maxrank = 0
    for (let x in sysconfig) {
        let config = sysconfig[x]
        if (config.max > maxrank) {
            maxrank = config.max
        }
    }
    const end = result.etime;
    let key = (`${id}-${global.gameconfig[id][0][1].key}`)
    if (await global.redis.get(`${key}-sign`)) {
        // "不可以释放这个检查判断。防止重复发送"
        return;
    }
    // let rankService = new global.services.RankService(key, groupid);
    const serv_groups = await global.dao.gameserver.fetchServers();
    for (const group of serv_groups) {
        const groupid = group._id;
        let rankService = new global.services.RankService(key, groupid);
        let list = await rankService.rank(1, maxrank);
        console.log("小黄鱼执行区服", key, groupid, list.length)
        let now = Date.now()

        const mails = [];
        // now < end
        if (now >= end) {
            for (let x = 0; x < list.length; x++) {
                let userrankinfo = list[x];
                let rank = x + 1
                let sysrankconfig
                let failconfig
                let failscore
                if (userrankinfo.score > 7000) {
                    console.log("小黄鱼执行区服玩家信息:", userrankinfo, list.length)
                }
                for (let x in sysconfig) {
                    let config = sysconfig[x]
                    let limtscore = config.limit

                    if (config.min <= rank && rank <= config.max) {
                        sysrankconfig = config
                    }

                    if (userrankinfo.score >= limtscore) {
                        if (!failscore || failscore <= limtscore) {
                            failconfig = config
                            failscore = limtscore
                        }
                    }
                }
                if (!sysrankconfig) {
                    console.error('备注表错误')
                    break;
                }

                if (userrankinfo.score > sysrankconfig.limit) {
                    let items = configitem(sysrankconfig)
                    mails.push({
                        rid: userrankinfo.id,
                        type: 2,
                        title: tg("XIAOHUANGYURANKTITLE"),
                        content: tg("XIAOHUANGYURANK", rank, rank),
                        reward: items,
                    });

                } else if (failconfig && userrankinfo.score >= failconfig.limit) {
                    let items = configitem(failconfig)
                    mails.push({
                        rid: userrankinfo.id,
                        type: 2,
                        title: tg("XIAOHUANGYURANKTITLE"),	// 无法获得奖励邮件通知
                        content: tg("XIAOHUANGYURANKFAIL", rank, failconfig.min),
                        reward: items,
                    });
                }
            }
        }
        if (now > end && mails.length > 0) {
            console.log("有数据写入", mails.length)
            await global.redis.set(`${key}-sign`, "ok");
            await global.dao.mail.insertMany(mails);
        } else {
            console.log("没有数据写入", now, end, result, "时间参数", key, groupid)
        }
    }
}
