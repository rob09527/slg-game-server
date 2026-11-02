

'use strict'
const moment = require('moment')
/**
 *
 * @param role
 * @param itemID {string} 内容项ID
 * @param type {string} 分为 reward(领取类奖励, sppack (礼包类奖励
 */
module.exports = exports =  function (role, itemID, type = 'reward') {
    let require;
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
    require = rewardObj.require;
    if(!require){ // 没有要求配置 直接通过
        return true;
    }
    const funcKey =  type+ (itemID||'DEF');
    if(this.requireFunc && this.requireFunc[funcKey]){ // 有动态函数缓存
        return this.requireFunc[funcKey](role, moment, this.start, this.etime);
    }
    let m = require.match(/(^|&)[\w\d\.]+[><=]/g) || [];
    let str =  require;
    for (let a of m) {
        const name = a.substring(0, a.length - 1).replace('&', '');
        let sand = '';
        if(a[0] === '&'){
            sand = '&';
        }
        str = str.replace(a, `${sand}role.getProp('${name}')${a.substr(-1)}`);
    }
    this.requireFunc = this.requireFunc || {};
    const fn = new Function('role', 'moment', 'start', 'etime' ,  `return `+ str);
    this.requireFunc[funcKey] = fn;
    return fn(role, moment, this.start, this.etime);
}
