

'use strict'

module.exports = exports =  function (role, itemID, type = 'reward') {

    let rewardObj;
    if(!this.params[type]){
        return false;
    }
    if(itemID ){
        rewardObj = this.params[type][itemID]
    } else {
        rewardObj = this.params[type];
    }
    if(!rewardObj){ // 没有奖励配置返回 false
        return false;
    }
    if(!rewardObj.consume || rewardObj.consume.length === 0){
        // 没有消耗直接返回 true
        return true;
    }
    const consume = this.calConsume(role, itemID, type);
    if (!consume){ // 没有消耗返回 true
        return true;
    }
    for (const {GSID, COUNT = 1} of  consume) {
        if(role.getProp(GSID) < COUNT){
            return false;
        }
    }
    return true;
}
