
'use strict'
const configitem = require('../util/configitem');
const tg = require('../util/textgetter');
const timekey = require('../util/timekey');
exports.name = "新服开服推图活动奖励邮箱结算"; // 每日定时器，负责执行 周 日 月标记刷新

// 定时器语句
//每天凌晨三点30执行
exports.cron = "0 30 3 * * *";


exports.main = async function () {
    await gloalrankinfo()

}
async function gloalrankinfo() {
    const serv_groups = await global.dao.gameserver.fetchServers();
    for (let x of serv_groups) {
        let rankService = new global.services.RankService('pushmap', x.servid);
        let rediskey = `${x.servid}-kftt`
        let pd = await global.redis.get(rediskey)
        let checktime = Date.now() - x.start
        let time = 1000 * 60 * 60 * 24 * global.gameconfig.panda.ZSJSB[0].etime
        console.log('新服开服推图定时器', x.servid, pd)
        if (pd || checktime < time) {
            continue;
        }
        let maxlength = global.gameconfig.kftt.length - 1
        let list = await rankService.rank(1, global.gameconfig.kftt[maxlength].MAX);
        const mails = [];
        list = list.map(({ id, score, rank }) => {
            let item = []
            for (let x in global.gameconfig.kftt) {
                let data = global.gameconfig.kftt[x]
                if (rank <= data.MAX) {
                    item = data.item
                    let content = ''
                    content = tg("KFTT", rank, rank)
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
        if (mails.length > 0) {
            await global.dao.mail.insertMany(mails);
            await global.redis.set(rediskey, "ok")
        }
    }

}






