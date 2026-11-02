'use strict';


// 获取总击杀奖励
module.exports = async function () {

    const lastBoss = await this.find({expireAt: {$gte: Date.now()}}).sort({mapid: -1}).limit(1);
    return lastBoss[0]? lastBoss[0].mapid + 1 : 1;
};
