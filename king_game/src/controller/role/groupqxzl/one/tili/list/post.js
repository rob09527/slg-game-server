'use strict'

module.exports = exports = async (ctx, next) =>{
    ctx.body = [];
    let roleVip = ctx.role.vip;
    let bought = 0;
    let index = ctx.config.VIP.findIndex(value=>value.VIP == roleVip);
    index = index == -1 ? ctx.config.VIP.length - 1 : index;
    for (let pos = 0; pos <= index; pos++) {
        bought += (ctx.qxzl.record[pos] || 0);
    }
    for (let i = 0; i <= index; i++) {
        let value = ctx.config.VIP[i];
        if (bought < value.LIMIT) {
            let obj = {};
            obj.val = value.VAL;
            obj.gsid = value.GSID;
            obj.count = value.COUNT;
            obj.vip = value.VIP;
            obj.limit = ctx.config.VIP[index].LIMIT;
            obj.index = i;
            obj.buytime =  obj.limit - bought;
            ctx.body.push(obj);
            return;
        }
    }
}