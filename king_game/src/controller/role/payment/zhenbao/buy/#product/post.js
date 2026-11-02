
'use strict'

module.exports = async ctx => {
    let {
        // 必传参数
        platform,
        bundle,
        channel,
        version,
        // 可选参数(目前只有一个)
        index = 0,
    } = ctx.request.body;
    let {
        product,
    } = ctx.params;
    product = {
        'dailypack': {
            config: 'zhenbao_dailypack',
            pidprefix: 'zbdp',
        },
        'fund': {
            config: 'zhenbao_fund',
            pidprefix: 'zbfund',
        },
    }[product];
    const config = global.gameconfig[product.config][index];
    ctx.assert(config, 'invalid product');
    let param = {
        platform,
        bundle,
        channel,
        version,

        uid: ctx.role.uid,
        rid: ctx.role.i(),
        servid: ctx.role.servid,

        pid: [product.pidprefix, index].join('_'),
        price: config.PRICE,
    }
    const {
        data,
    } = await ctx.orderReq(param);
    ctx.assert(!data.error, data.error);
    ctx.body = data;
}