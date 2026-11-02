
'use strict'
const configitem = require('../util/configitem');
const tg = require('./../util/textgetter');
exports.name = "充值排行榜奖励邮箱结算"; // 每日定时器，负责执行 周 日 月标记刷新

// 定时器语句
exports.cron = "0 0 0 * * *";
//exports.cron = "0/5 * * * * ?";

exports.main = async function () {
    let result = await global.dao.activity.findOne({ type: "CZPHB" })
    let id = "czphb"
    const zhd = global.config.ZHD[id.toUpperCase()];
    const [start] = zhd;
    const end = result.etime;
    let sysconfig = global.gameconfig[id][0]
    let maxrank = 0
    for (let x in sysconfig) {
        let config = sysconfig[x]
        if (config.max > maxrank) {
            maxrank = config.max
        }
    }
    let key = (`${id}-${global.gameconfig[id][0][1].key}`)
    let domongodb = await global.redis.get(`${key}-sign`)
    if (domongodb) {
        // "不可以释放这个检查判断。防止重复发送"
        return;
    }
    let rankService = new global.services.RankService(key);
    let list = await rankService.rank(1, maxrank);
    const lang = await global.remote.proxy_getlanguage()
    // //逻辑变更写死
    // const lang = 'cn'
    let now = Date.now()
    console.log("充值排行榜", list.length, list, key, now, end)

    const mails = [];
    // now < end
    if (now >= end) {
        console.log("充值排行榜进入执行区", lang)
        for (let x = 0; x < list.length; x++) {
            let rank = x + 1
            let userrankinfo = list[x];
            let sysrankconfig
            let failconfig
            let failscore
            for (let x in sysconfig) {
                let config = sysconfig[x]
                if (config.min <= rank && rank <= config.max) {
                    sysrankconfig = config
                }
                if (userrankinfo.score >= config[lang.toLocaleLowerCase()]) {
                    if (!failscore || failscore <= config[lang.toLocaleLowerCase()]) {
                        failconfig = config
                        failscore = config[lang.toLocaleLowerCase()]
                    }
                }
            }
            if (!sysrankconfig) {
                console.error('备注表错误')
                break;
            }
            let limtscore = sysrankconfig[lang.toLocaleLowerCase()]
            if (userrankinfo.score >= limtscore) {
                let items = configitem(sysrankconfig)
                mails.push({
                    rid: userrankinfo.id,
                    type: 2,
                    title: tg("CHONGZHIRANKTITLE"),	// 无法获得奖励邮件通知
                    content: tg("CHONGZHIRANK", rank, rank),
                    reward: items,
                });
            } else if (failconfig && userrankinfo.score >= failconfig[lang.toLocaleLowerCase()]) {
                let items = configitem(failconfig)
                mails.push({
                    rid: userrankinfo.id,
                    type: 2,
                    title: tg("CHONGZHIRANKTITLE"),	// 无法获得奖励邮件通知
                    content: tg("CHONGZHIRANKFAIL", rank, failconfig.min),
                    reward: items,
                });
            }
        }
        if (!domongodb && mails.length > 0) {
            console.log("充值排行榜有数据入库", mails.length, mails)
            await global.redis.set(`${key}-sign`, "ok");
            await global.dao.mail.insertMany(mails);
        } else {
            console.log("充值排行榜没有数据入库")
        }
    }

}
