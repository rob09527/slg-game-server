'use strict'
/**
 * 印记穿戴
 */
module.exports = exports = async (ctx, next) =>{
    let {
		signetpos,
	} = ctx.request.body;
    ctx.assert(signetpos >= 0 && signetpos <= 7 ,'signetpos not exists');
    ctx.assert(!ctx.signet.general,'signet has general')
    let prop = ctx.signet.prop;
    let gsid = ctx.general.gsid;
    let general = global.gameconfig.general[gsid];
    let camp = general.CAMP;
    let occu = general.OCCU;
    let occu2 = general.OCCU2;
    //判断条件是否满足
    let name = general.NAME;
    let gsids = [];
    for (const key in global.gameconfig.general) {
        if (Object.hasOwnProperty.call(global.gameconfig.general, key)) {
            if(global.gameconfig.general[key].NAME == name){
                gsids.push(key);
            };
        };
    };
    let sg_conf = gsids.some((g)=>{
        return prop["gsid"] == g;
    });
    ctx.assert(prop["camp"] == camp || prop["occu"] == occu || prop["occu"] == occu2|| sg_conf ,'condition limit');

    signetpos = ctx.signet.gsid % 10;
    /**
     * 是否有装备同类型的印记
     */
    let signet = ctx.general.signet;
    //  for (let i = 0; i < signet.length; i++) {
    //     if(i == signetpos) continue;
    //     const si = signet[i];
    //     if(!si) {
    //         signetpos = i;
    //         break;
    //     }
    // }
    let signet_conf = global.gameconfig.signet[ctx.signet.gsid];
    for (let i = 0; i < signet.length; i++) {
        if(i == signetpos) continue;
        const si = signet[i];
        if(!si) continue;
        let si_mo = await ctx.dao.signet.findOne({_id: si}, {gsid:1});
        if(!si_mo) continue;
        let si_conf = global.gameconfig.signet[si_mo.gsid];
        if(si_conf.TYPE == signet_conf.TYPE){
            signetpos = i;
            break;
        };
    }
    // 移除之前的印记
    let last_signet = ctx.general.signet[signetpos];
    if(last_signet){
        await ctx.dao.signet.updateOne({_id: last_signet}, {$unset: {general: 1}});
    };
    ctx.general.signet[signetpos] = ctx.signet._id.toString();
    ctx.general._signet_ = ctx.general._signet_ || [];
    ctx.general._signet_[signetpos] = ctx.signet.base();

    ctx.general.markModified(`signet.${signetpos}`);

    ctx.signet.general = ctx.general._id.toString();
    ctx.signet.markModified('general');
    await ctx.signet.save();

}