/**
 * 清楚到期活动的标记
 */
'use strict'


const _type = require('./../common/type');

module.exports = exports = function () {
    const now = Date.now();
    let needSave = false;
    for (let k in ACTIVITY) {
        // 判断活动过期
        const act = ACTIVITY[k];
        if(act.etime < now){
            const up = k.toUpperCase();
            if(this.act && this.act[up]){
                needSave = true;
                this.markModified('act.'+up);
                delete this.act[up];
            }

        }
    }
    return needSave;
}
