
'use strict'

module.exports = exports = async (ctx, next) =>{
    let {type} = ctx.request.body;
    ctx.body = {
        maxid:ctx.role.dltp.map[type - 1],
        mopup:ctx.role.dltp.mopup[type - 1],
        shop: {},
    }
    let dlshop = ctx.role.dltp.shop[type];
    for (let pos in dlshop) {
        ctx.body.shop[pos] = {
            expire: dlshop[pos].expire,
            type: dlshop[pos].type,
            items:dlshop[pos].shop.map((info) =>{
                let obj = {type: info.type, bought:info.limit - info.buy, items:info.items};
                if (info.type == 1) {
                    obj.price = info.price;
                    obj.name = info.name;
                } else {
                    obj.cost = info.cost;
                }
                return obj;
            })
        };
    }
}