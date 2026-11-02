'use strict'
/**
 * 印记卸下
 */
module.exports = exports = async (ctx, next) =>{
    let {
		signetpos,
	} = ctx.request.body;
    ctx.assert(signetpos >= 0 && signetpos <= 7 ,'signetpos not exists');

    // 移除之前的印记
    let last_signet = ctx.general.signet[signetpos];
    if(last_signet){
        await ctx.dao.signet.updateOne({_id: last_signet}, {$unset: {general: 1}});
    };
    ctx.general._signet_[signetpos] = null;
    ctx.general.signet[signetpos] = null;

    ctx.general.markModified(`signet.${signetpos}`);


}