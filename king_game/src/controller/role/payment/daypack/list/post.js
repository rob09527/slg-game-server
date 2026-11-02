
'use strict'
// 日礼包列表展示
module.exports = exports = async function (ctx, next) {

    ctx.body = {
        items: ctx.config.map(({ ID: id, TRIGGER: trigger, REFRESH: refresh, PRICE: price,
            LIMIT: limit, ITEMS: items, PATH: path, VIP: vip, LOCK: lock, MARK: mark
        }, index) => {
            let buytime = limit - (ctx.record[index] || 0);
            if (index == ctx.config.length - 1) buytime = ctx.canYijian ? 1 : 0
            let tmp = {
                id,
                trigger,
                refresh,
                price,
                buytime,
                items,
                path,
                vip,
                lock,
                mark
            };
            return tmp;
        }),
        ispay: ctx.ispay,
        day: ctx.day,
    }
}