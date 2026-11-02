
'use strict'
const { forEach } = require('lodash');
const configitem = require('../util/configitem');
const configitemlist = require('../util/configitemlist');
const tg = require('../util/textgetter');
const isBetweenThursday2330AndFriday0030 = require('../util/isBetweenThursday2330AndFriday0030');
exports.name = "pvp3vs3数据清理奖励下发"; // 每日定时器，负责执行 周 日 月标记刷新

// 定时器语句
exports.cron = "25 0 * * 5";
// exports.cron = "0/5 * * * * ?";

exports.main = async function () {
    // if (!isBetweenThursday2330AndFriday0030()) {
    //     console.log('不在时间区间')
    //     return;
    // }
    console.log('pvp3vs3数据清理奖励下发开始执行')
    let key = "pvp3vs3"
    let rankService = new global.services.RankService(key);
    let list = await rankService.rank(1, 50);
    let roles = list.map(({ id }) => id);
    roles = await global.dao.role.find({ _id: { $in: roles } });
    const tmp = {};
    roles.forEach(one => {
        tmp[one._id.toString()] = one;
    })
    list = list.map(({ id, score, rank }) => {
        let role = tmp[id];
        if (!role) return;
        return {
            rid: role.i(),
            rank: rank,
            score,
        }
    }).filter(Boolean);

    let result = global.gameconfig.pvpmultiplayer[1]
    configitemlist(result)
    let mails = []
    list.map(role => {
        result.forEach(e => {
            if (role.rank >= e.MIN && role.rank <= e.MAX) {
                mails.push({
                    rid: role.rid,
                    type: 2,
                    title: tg("ANONYMOUS_PREFIX"),// 无法获得奖励邮件通知
                    content: tg("THREEPVP", role.rank),
                    reward: e.item,
                });
            }
        })
    })
    if (mails.length > 0) {
        await global.dao.mail.insertMany(mails);
        await rankService.clear()
        await global.dao.c_pvp_three.deleteMany({})
        console.log('pvp3vs3数据清理奖励下发执行成功')
    }

}
