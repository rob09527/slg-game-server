'use strict';

// 可以领取的荣耀数值
module.exports = exports = {
    get() {
        const MAX_HONOR = global.gameconfig.ring_rank.CONFIG.MAX_HONOR || 10000; // 最大暂存量
        const honorRate = global.dao.ringrank.getHonorRate(this.rank);
        this.last_honor_time = this.last_honor_time || Date.now();
        const time = Date.now() - this.last_honor_time;
        const times = Math.floor(time / 5000);
        const addHonor = Math.round(times * honorRate); // 产出的荣耀
        this._time_offset = time % 5; //记录5秒余数,作为下一次计算的偏移;
        return Math.min(MAX_HONOR, addHonor + this.honor_pool); // 加上之前暂存的荣耀为总共活动荣耀
    }
}
