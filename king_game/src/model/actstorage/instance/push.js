"use strict"

/**
 * 添加本服活动记录
 * @param {Array} items
 * @param {boolean} limitLength 是否限制长度
 */
module.exports = function (items, limitLength = true) {
    items = items.map(({ GSID: gsid, COUNT: count, ...others }) => {
        let result = { ...others };
        if (gsid) result.gsid = gsid;
        if (count) result.count = count;
        return result;
    });
    let log = `${this.mode}_log`;
    this[log] = this[log] || [];
    this[log].push(...items);
    if(limitLength) {
        const { SAVECOUNT } = global.gameconfig.zhd[this.mode.toUpperCase()];
        let diff = this[log].length - SAVECOUNT;
        for (let i = 0; i < diff; i++) {
            this[log].shift();
        }
    }
    this.markModified(log);
}