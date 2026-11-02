'use strict'

/**
 * 创建订单
 *
 * @example 游戏服代码实例
 *          const res = await global.remote.proxy_order_create({
 *              platform, bundle, channel, version, price,
                pid: [ctx.daysign, index].join('_'),
                uid: ctx.role.uid,
                rid: ctx.role.i(),
                servid: ctx.role.servid,
 *          });
 *
 * @param params
 * @return {Promise<any>}
 */
module.exports = async function (params) {
    if (global.config.LANG == 'VN') {
        const config = global.proxyconfig.moneys[params.price];
        if (config && global.config.LANG == 'VN' && config[global.config.LANG]) {
            params.price = config[global.config.LANG];
        } else {
            console.error(config, params)
            throw ('money.json error')
        }
    }
    let order = new global.dao.order(params);
    order.gemOidNoSave();
    await order.save();
    return { oid: order.oid };
}
