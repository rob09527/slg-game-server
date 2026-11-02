
'use strict'
// 霸王礼包列表
const overlordConfig = global.gameconfig.overlord;
module.exports = exports = async function (ctx, next) {
    let record = ctx.role.overlord || [];
    ctx.body = overlordConfig.map((info,index) => {
        let bought = record[index] || 0;
        let tmp = {
            index: info.index,
            items: info.ITEMS,
            buytime: info.LIMIT - bought,
            price: info.PRICE,
            type:info.TYPE,
            vip:info.VIP
        };
        if(info.PATH) tmp.path = info.PATH;
        return tmp;
    })
}