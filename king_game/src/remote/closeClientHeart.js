'use strict'
/**
 * 踢掉心跳超时的用户
 * @param timeout {[number] | number}
 * @param params {number|string}
 */
module.exports = async function (timeout, ...params) {
    let time = timeout || 5 * 60 * 1000;  //5分钟
    const now = Date.now()
    for (const rid in CLIENT_POOL) {
        const heart = CLIENT_POOL[rid]._last_ping_;
        // console.log("closeClientHeart",rid,now-heart);
        if(now - heart > time){
            CLIENT_POOL[rid].disconnect(...params);
        }
    }
    return "OK"
}
