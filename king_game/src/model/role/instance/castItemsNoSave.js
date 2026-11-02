/**
 * 角色道具消耗
 * @param {number|string|Array<Record<gsid: string, count: number>>} items 道具GSID或列表
 * @param {string | Record<main: string, sec: string>} reason 消耗理由
 */

'use strict'

const assert = require('assert');

const _type = require('./../common/type');
const zhdpoint = require('./../../../util/event/point');

module.exports = exports = function (items, reason) {

    this.cast_items = this.cast_items || [];

    if (!Array.isArray(items)) items = [items];

    for (let item of items) {
        let gsid = item.GSID || item.gsid;
        let count = parseInt(item.COUNT || item.count) || 0;
        let type = _type(gsid);
        assert(type !== 'general', 'cant cast');
        let currentCount = this[type][gsid] ? this[type][gsid].count : 0;
        if (this._change_items_ && this._change_items_[gsid]) {
            currentCount += this._change_items_[gsid];
        }
        assert(currentCount >= 0, 'illegal itemnum');
        assert(currentCount >= count, 'no enough');
        assert(count >= 0, "illegal count");

        let limitCount = global.gameconfig.gsid_limit[gsid] || 0;
        if (limitCount > 0) {
            this._limit_items = this._limit_items || {};
            this._limit_items[gsid] = this._limit_items[gsid] || 0;
            let useCount = this.castlimit[gsid] ? this.castlimit[gsid].count : 0;
            let curCount = this._limit_items[gsid] + count;
            assert(useCount + curCount < limitCount, "use limit count");
            this._limit_items[gsid] += count;
        }

        this._change_items_ = this._change_items_ || {};
        this._change_items_[gsid] = this._change_items_[gsid] || 0;
        this._change_items_[gsid] -= count;
    }
    this.cast_items.append(items.map(item => {
        let GSID = item.GSID || item.gsid;
        let COUNT = item.COUNT || item.count;
        let item_tmp = { GSID, COUNT };
        if (reason) item_tmp.reason = reason;
        return item_tmp;
    }));
    zhdpoint('ACCUMUL', this, { type: 0, items, reason });

    if (reason && reason.main === 'auction') {

    } else {
        zhdpoint('SYS_SUMCOUNT', this, { type: 0, items, reason });
    }

}
