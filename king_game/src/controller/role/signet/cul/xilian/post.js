'use strict'
/**
 * 洗练
 * @param {*} ctx 
 * @param {*} next 
 */
module.exports = async (ctx, next) => {
    
    ctx.assert(ctx.signet.appraise,'appraise not exists');
    const signet_appraise = global.gameconfig.signet_appraise_pool.filter((sa)=>sa.GSID==ctx.signet.gsid).find((sa)=>sa.TYPE==ctx.signet.appraise.type);
    let atrr_key = signet_appraise.ATTRS;
    let attr_var = ctx.signet.appraise[atrr_key];
    ctx.assert(attr_var < signet_appraise.MAX,'attr max');
    ctx.signet.appraise[atrr_key] = ctx.random.between(signet_appraise.MIN, signet_appraise.MAX);

}