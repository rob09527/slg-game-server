
'use strict'

const assert = require('assert');
const tg = require('../../../util/textgetter');
// 更新竞猜胜利的人的订单结果
module.exports = exports = async function (groupid, mark) {

    console.log(`wangpvp wang mark ${mark},groupid ${groupid}`, new Date().toLocaleString());
    await this.db.models.wangpvpguess.updateMany({ groupid, mark }, {
        $set: {
            finish: Date.now(),
            bingo: 1
        }
    });
    // 查出所有竞猜成功的玩家,发送邮件
    let bingoUsers = await this.db.models.wangpvpguess.find({ groupid, bingo: 1 });
    let dealymails = [];
    for (let user of bingoUsers) {
        dealymails.push({
            rid: user.rid,
            rewards: user.pay,
            title: tg(`WANGPVP_BINGOT`),
            content: tg(`WANGPVP_BINGOC`),
            model: 'wangpvpguess'
        })
    };
    // 竞猜失败的玩家
    let noBingoUsers = await this.db.models.wangpvpguess.find({ groupid, bingo: { $exists: 0 } });
    for (let user of noBingoUsers) {
        dealymails.push({
            rid: user.rid,
            title: tg(`WANGPVP_NOBINGOT`),
            content: tg(`WANGPVP_NOBINGOC`),
            model: 'wangpvpguess',
            finish: 0, // 初始化为0
        })
    };
    // 插入延迟邮件
    await this.db.models.dealymail.insertMany(dealymails);

}