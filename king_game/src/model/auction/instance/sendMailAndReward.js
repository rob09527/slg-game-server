'use strict';
const tg = require('./../../../util/textgetter');
/**
 * 发邮件并分红
 */
module.exports = async function () {
    const history = [].concat(this.history);
    if(history.length === 0){
        this.status = 2; // 标记已经处理过了
        await this.save();
        return;
    }
    const last = history.pop(); // 最后一个为竞拍获得者
    const mails = [];
    mails.push({
        title: tg(`AUCTION_${last.isonce ? 'BUY' : 'TOP'}_T`),
        content: tg(`AUCTION_${last.isonce ? 'BUY' : 'TOP'}_C`, last.price),
        rid: last.rid,
        type: 2,
        reward: [{GSID: this.item.gsid, COUNT: this.item.count}],
    });

    const roleGroup = {};
    for (let h of history) {
        if (h.state) {
            continue;
        }
        roleGroup[h.rid] = roleGroup[h.rid] || 0;
        roleGroup[h.rid] += h.price; // 计算每一个参与者的拍卖总金额
    }
    mails.append(Object.keys(roleGroup).map(rid => {
        return {
            type: 2,
            rid,
            title: tg('AUCTION_FAIL_T'),
            content: tg('AUCTION_FAIL_C', roleGroup[rid]),
            reward: [{
                GSID: 38005,
                COUNT: roleGroup[rid],
            }],
        };
    }));

    await this.db.models.mail.insertMany(mails);
    this.history.forEach(h => {
        h.state = true; // 全部标记已经返还
    });
    this.status = 1; // 标记售出
    this.markModified('history');
    await this.save();
};
