'use strict'
/**
 * 印记转换
 * @param {} ctx 
 * @param {*} next 
 */
module.exports = async (ctx, next) => {
   
    ctx.assert(ctx.signet.appraise,'appraise not exists');

    let appraise = global.gameconfig.signet_appraise_pool.filter((sa)=>sa.GSID==ctx.signet.gsid).find((sa)=>sa.TYPE!=ctx.signet.appraise.type);
    appraise = {
        type:appraise.TYPE,
        [appraise.ATTRS]:ctx.random.between(appraise.MIN, appraise.MAX),
    }
    ctx.signet.appraise = appraise;
}