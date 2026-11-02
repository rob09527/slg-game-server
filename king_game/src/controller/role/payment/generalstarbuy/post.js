
'use strict'
// 武将升星礼包购买
module.exports = async (ctx, next)=>{
    let { index, price, platform, bundle, channel, version } = ctx.request.body;
    
    const {GIFT} = global.gameconfig.generalstar;
    let info = GIFT[index];
    ctx.assert(info, 'gift not exist');
    ctx.assert(+info.PRICE == +price, 'price err');

    let record = await global.dao.generalstar.findOne({rid: ctx.role.i(), gname:'guanyu'});
    ctx.assert(record, 'record not exist');
    // 校验时间
    ctx.assert(Date.now() < record.expire, 'active expired')
    // 校验购买次数
    ctx.assert((record.buylimit[index] || 0) < info.LIMIT, "no more");
    
    if(typeof record.buylimit[index] !== 'number'){
        record.buylimit[index] = 0;
        // 初始化购买次数[0,0,...]
        for(let l =0; l < record.buylimit.length; l++){
            if(typeof record.buylimit[l] !== 'number'){
                record.buylimit[l] = 0;
           }
        }
        await global.dao.generalstar.updateOne({rid: ctx.role.i(), gname:'guanyu'}, {$set: {buylimit: record.buylimit}});
    }
    let param = {
        platform,
        bundle,
        channel,
        version,
        pid: ['generalstar', index].join('_'),
        price: info.PRICE,
        uid: ctx.role.uid,
        rid: ctx.role.i(),
        servid: ctx.role.servid,
    }
    const { data } = await ctx.orderReq(param);
    ctx.assert(!data.error, data.error);
    ctx.body = data;
}