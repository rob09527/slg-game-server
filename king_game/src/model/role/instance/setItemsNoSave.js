
'use strict'

module.exports = exports = function (items, reason) {

    if (!Array.isArray(items)) items = [items];

    let add = [];
    let cast = [];

    for (let item of items) {
        let gsid = item.GSID || item.gsid;
        let count = parseInt(item.COUNT || item.count) || 0;
        let num = this.getProp(gsid);
        if( count == num) continue;
        if( count > num){
            add.push({GSID:gsid, COUNT: count-num});
        }
        else{
            cast.push({GSID:gsid, COUNT: num-count});
        }
    }

    cast.length && this.castItemsNoSave(cast, reason);
    add.length && this.addItemsNoSave(add, reason);
}
