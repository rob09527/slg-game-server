"use strict"

/**
 * 
 * @param {string} key 活动或系统在others.json中的key
 * @param {number} servid 角色中的服务器ID
 */
module.exports = function(key, servid) {
    const { START } = global.gameconfig.others[key];
    if (servid < 9000) return Date.parse(START.RELEASE);
    else if (servid == 9001) return Date.parse(START.PREPUB);
    else return Date.parse(START.DEFAULT);
}