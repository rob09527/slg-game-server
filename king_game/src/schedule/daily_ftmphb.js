
'use strict'
const configitem = require('../util/configitem');
const tg = require('../util/textgetter');
const timekey = require('../util/timekey');
exports.name = "飞天猫排行榜奖励邮箱结算"; // 每日定时器，负责执行 周 日 月标记刷新

// 定时器语句
exports.cron = "0 0 0 * * *";
//exports.cron = "0/5 * * * * ?";

exports.main = async function () {
    await gloalrankinfo()
    await dailyrankinfo()
}
async function gloalrankinfo() {
    let act = global.ACTIVITY['ftmphb']
    let id = timekey().ftmphb.globalkey
    let result = await global.dao.activity.findOne({ type: "FTMPHB" })
    if (result.params[id] || Date.now() < act.etime || await global.redis.get(`${id}-sign`)) {
        // "不可以释放这个检查判断。防止重复发送"
        console.log(await global.redis.get(`${id}-sign`), Date.now() > act.etime)
        return;
    }
    console.log('执行全局飞天猫排行榜', id)
    let rankService = new global.services.RankService(id);
    let maxlength = Object.keys(global.gameconfig.ftmphb[1]).length
    let list = await rankService.rank(1, global.gameconfig.ftmphb[1][maxlength].max);
    const mails = [];
    list = list.map(({ id, score, rank }) => {
        let item = []
        for (let x in global.gameconfig.ftmphb[1]) {
            let data = global.gameconfig.ftmphb[1][x]
            if (score >= data.condition && item.length == 0 && rank <= data.max) {
                item = data.item
                let content = ''
                if (rank >= data.min && rank <= data.max) {
                    content = tg("FTMPHB_1", rank, rank)
                } else {
                    content = tg("FTMPHB_2", rank, data.min)
                }
                mails.push({
                    rid: id,
                    type: 2,
                    title: tg("ANONYMOUS_PREFIX"),	// 无法获得奖励邮件通知
                    content: content,
                    reward: item,
                });
            }
        }
    }).filter(Boolean);

    result.params[id] = true
    let data = { 'params': result.params }
    await global.redis.set(`${id}-sign`, "ok");
    await global.dao.activity.update({ type: "FTMPHB" }, { "$set": data })
    await global.dao.mail.insertMany(mails);
}



async function dailyrankinfo() {
    // const now = new Date(); // 当前日期和时间
    // now.setDate(now.getDate() - 1);
    let id = timekey().ftmphb.dailyjs
    let result = await global.dao.activity.findOne({ type: "FTMPHB" })
    if (result.params[id] || await global.redis.get(`${id}-sign`)) {
        // "不可以释放这个检查判断。防止重复发送"
        return;
    }
    console.log('执行每日飞天猫排行榜', id)
    const serv_groups = await global.dao.gameserver.fetchServers();
    for (const group of serv_groups) {
        const groupid = group._id;
        let rankService = new global.services.RankService(id, groupid);
        let maxlength = Object.keys(global.gameconfig.ftmphb[1]).length
        let list = await rankService.rank(1, global.gameconfig.ftmphb[1][maxlength].max);
        const mails = [];
        list = list.map(({ id, score, rank }) => {
            console.log(id, score, rank)
            let item = []
            for (let x in global.gameconfig.ftmphb[0]) {
                let data = global.gameconfig.ftmphb[0][x]
                if (score >= data.condition && item.length == 0 && rank <= data.max) {
                    item = data.item
                    let content = ''
                    if (rank >= data.min && rank <= data.max) {
                        content = tg("FTMPHB_3", rank, rank)
                    } else {
                        content = tg("FTMPHB_4", rank, data.min)
                    }
                    mails.push({
                        rid: id,
                        type: 2,
                        title: tg("ANONYMOUS_PREFIX"),	//无法获得奖励邮件通知
                        content: content,
                        reward: item,
                    });
                }
            }
        }).filter(Boolean);

        result.params[id] = true
        console.log('daily email reward', mails.length)
        let data = { 'params': result.params }
        await global.redis.set(`${id}-sign`, "ok");
        await global.dao.activity.update({ type: "FTMPHB" }, { "$set": data })
        await global.dao.mail.insertMany(mails);
    }
}

