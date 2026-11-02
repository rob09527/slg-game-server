'use strict';
const fpool = require("../../../util/random/fpool");
/**
 * 奖励领取
 * @param role
 * @param rewardId
 * @param timeCount 领取多少次
 */
module.exports = exports = async function (role, timeCount = 1) {

    assert(this.params.lucky, 'not locky act'); // 非领取抽奖类活动
    const configParams = this.params.lucky;
    assert(Array.isArray(configParams.items), 'error locky'); // 非领取抽奖类活动
    const limit = configParams.limit || 1; // 领取次数

    const rec = role.act[this.type] || {lucky: {times: 0}};
    if (!role.act[this.type]) {
        role.act[this.type] = rec;
    }
    rec.lucky = rec.lucky || {times: 0};
    assert(this.requireCheck(role, null, "lucky"), 'require condition');

    const consume = this.calConsume(role, null, "lucky");

    const result = {items: [], castitems: []};

    if (consume && consume.length > 0) { // 有设置消耗
        result.castitems = consume.map(c => ({...c, GSID: c.GSID, COUNT: c.COUNT * timeCount}));
        role.castItemsNoSave(result.castitems);
    }

    rec.lucky.times = rec.lucky.times || 0;
    assert(limit === -1 || rec.lucky.times + timeCount <= limit, 'received limit');
    rec.lucky.times += timeCount;
    for (let i = 0; i < timeCount; i++) {
        const item = fpool(configParams.items, 1, 'weight');
        if (item[0]) { // 将每一次抽取的奖励收集起来
            result.items.push(...item[0].items);
        }
    }

    role.addItemsNoSave(result.items);
    role.markModified('act.' + this.type + '.lucky');
    await role.save();
    return result;
};
