'use strict'
/**
 * 印记鉴定
 * @param {*} ctx 
 * @param {*} next 
 */
module.exports = async (ctx, next) => {
    
    ctx.assert(!ctx.signet.appraise,'appraise exists');

    let appraisepool = global.gameconfig.signet_appraise_pool.filter((sa)=>sa.GSID==ctx.signet.gsid);
    let index = Math.floor(Math.random()*appraisepool.length);
    let appraise = appraisepool[index];
    appraise = {
        type:appraise.TYPE,
        [appraise.ATTRS]:ctx.random.between(appraise.MIN, appraise.MAX),
    }
    ctx.signet.appraise = appraise;
}