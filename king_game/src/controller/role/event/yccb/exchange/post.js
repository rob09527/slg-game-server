/**
 * 
 * 迎春筹办---福卡兑换
 *  
 * 
 * */ 
 module.exports = exports = async (ctx) => {
    const {EXCHANGE:exchange} = ctx.config;
    let fragCount = ctx.role.getProp(exchange.FROM);
    let rate = exchange.RATE;
    ctx.assert(fragCount>= rate,'not enough')
    let excFrag = Math.floor(fragCount/rate) * rate;
    let excFucard = excFrag / rate;
    let reawradCount = excFucard;
    ctx.role.castItemsNoSave([{
        GSID:exchange.FROM,
        COUNT:excFrag
    }]);
    ctx.role.addItemsNoSave([{
        GSID:exchange.TO,
        COUNT:excFucard
    }]);
    ctx.role.markModified('yccb');
    await ctx.role.save();
    fragCount = ctx.role.getProp(exchange.FROM);
    let fucardCount = ctx.role.getProp(exchange.TO);
    excFrag = Math.floor(fragCount/rate) * rate;
    let excInfo = {
        excFucard:excFrag/rate,
        excFrag,
        rate
    }
    ctx.body = {
        items:[{
            GSID:exchange.TO,
            COUNT:reawradCount
        }],
        fragCount,
        fucardCount,
        excInfo
        
    } 
 }