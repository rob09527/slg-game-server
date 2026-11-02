
'use strict'


const _type = require('./../common/type');

/**
 * 内部刷新使用，外部不可使用
 * @type {exports}
 */
module.exports = exports = function () {
    if(this._change_items_){
        for (let k in this._change_items_){
            if(!this._change_items_[k]){
                continue;
            }
            const _type_ =  _type(k);
            this[_type_][k] = this[_type_][k] || {count: 0};
            this[_type_][k].count += this._change_items_[k];
        }
        this._change_items_ =  undefined; // 已经赋值给 this 本身，就要制空，否则 getItems 就会加重
    }
    this._limit_items = undefined;
}
