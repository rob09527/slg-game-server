'use strict';
const tg = require('./../../../util/textgetter');

/**
 *  构建拍卖行定时器
 */
module.exports = exports = async function () {
    console.log('ACUTION TASK DONING ', new Date().toLocaleString());
    const allAuc = await this.find({ // 找出未分红的已经结束的拍卖
        bounced: false,
        expireAt: {
            $lte: Date.now(),
        },
    }).sort({_id: -1}); // 查出全部未分红的拍品

    if (!allAuc.length) {
        return;
    }
    console.log('ACUTION COUNT ', allAuc.length, new Date().toLocaleString());
    const group = {};
    for (const a of allAuc) { // 按拍卖方分组
        group[a.groupkey] = group[a.groupkey] || [];
        group[a.groupkey].push(a);
    }
    const mails = [];
    const bonusArray = [];
    for (const k in group) {
        const list = group[k];
        const bonusMap = await this.calBonus(list);
        bonusArray.push(bonusMap);
        const [tp] = k.split('_');
        bonusMap._TYPE_ = tp.toUpperCase();
    }
    for (const bonusMap of bonusArray) {
        if (!bonusMap || !bonusMap.bonusRoles){
            continue;
        }
        const bonusRoles = bonusMap.bonusRoles;

        for (const rid of bonusRoles) {
            const bCount = bonusMap[rid] || bonusMap.def;
            if (!bCount) {
                continue;
            }
            const k = `AUCTION_${bonusMap._TYPE_}_BONUS_T`;
            mails.push({
                rid,
                title: global.gameconfig.text[k] ? tg(k) : tg(`AUCTION_BONUS_T`), // 兼容旧版本 拍卖标题配置
                content: tg(`AUCTION_BONUS_C`),
                type: 2,
                reward: [
                    {
                        GSID: 38005,
                        COUNT: bCount,
                    },
                ],
            });
        }

    }

    for (let a of allAuc) {
        console.log('ACUTION FINISHED , WILL DONGING ', a._id);
        a.bounced = true; // 标记已经分红

        if (a.status) { // 已经发放奖励，则跳过（一口价直接购买的情况
            await a.save()
            continue;
        }
        await a.sendMailAndReward(); // 发送奖励邮件
    }
    await this.db.models.mail.insertMany(mails);
    console.log('ACUTION BOUNCE FINISHED ');

    // 上线时去掉,因为测试时间线 1小时一个周期，太短，boss
    // if (group.north){   // 拍卖结算过后删除 北伐boss,
    //     await global.dao.north.deleteMany({});
    // }
};
