'use strict';

/**
 * 奖励领取
 * @param role
 * @param rewardId
 * @param timeCount 领取多少次
 */
module.exports = exports = async function (role, rewardId = undefined, timeCount = 1, idx = -1) {
    rewardId = (rewardId === 'DEFAULT' || rewardId === 'default') ? '': rewardId; // 如果前端传递 default
    assert(this.params.reward, 'not reward act'); // 非领取类活动
    const configParams = rewardId ? this.params.reward[rewardId] : this.params.reward;
    assert(configParams, 'not reward item'); // 没有该项奖励
    const limit = configParams.limit || 1; // 领取次数
    const rec = role.act[this.type] || {};
    if(!role.act[this.type]){
        role.act[this.type] = rec;
    }
    let recInfo; // 领取信息
    if (rewardId) {
        recInfo = rec[rewardId];
    } else {
        recInfo = rec;
    }
    assert(this.requireCheck(role, rewardId), 'require condition');

    const consume = this.calConsume(role, rewardId, "reward");
    const result = { items: [] ,castitems : [] };
    if(consume && consume.length > 0) { // 有设置消耗
        result.castitems = consume.map(c => ({...c, GSID: c.GSID, COUNT: c.COUNT * timeCount}));
        role.castItemsNoSave( result.castitems);
    }
    recInfo = recInfo || {};
    recInfo.times = recInfo.times || 0;
    assert(limit === -1 || recInfo.times + timeCount <= limit, 'received limit');
    if(configParams.items){
        for (let k in configParams.items){
            const it = configParams.items[k];
            if(it.expire === '-1D'){ // 同活动结束
                it.expire = this.etime;
            }
        }
    }
    result.items = configParams.items.map(c => ({...c, GSID: c.GSID, COUNT: c.COUNT * timeCount}));
    if (!rewardId && idx >= 0 && result.items[idx]) {
        result.items = [result.items[idx]];
    }
    role.addItemsNoSave(result.items);
    recInfo.times+= timeCount;

    if (role.newg && role.newg.length > 0) {
        // 如果有领取到武将信息，把武将信息存起来
        if(role.newg.length > 1){
            recInfo.guids = role.newg.map(g => g._id.toString());
            result.generals = role.newg.map(g => g._role = role && g.base());
        } else {
            recInfo.guid = role.newg[0]._id.toString();
            role.newg[0]._role = role;
            result.general = role.newg[0].base();
        }
    }
    if(rewardId){
        rec[rewardId] = recInfo;
    } else {
        role.act[this.type] = recInfo;
    }
    role.markModified('act.'+this.type);
    await role.save();
    return result;
};
