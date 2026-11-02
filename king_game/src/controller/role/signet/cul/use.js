'use strict'
const moment = require('moment')

module.exports = async (ctx, next) => {
    let {
        guid,
        cguid,
        generalguid:general
    } = ctx.request.body;
    let signet = await ctx.dao.signet.findOne({_id:guid});
    ctx.assert(signet,'signet not exists');
    let signetcfn = global.gameconfig.signet[signet.gsid];
    ctx.assert(signetcfn.QUALITY == 6,'signet not quality');
    ctx.signet = signet;

    let csignet = await ctx.dao.signet.findOne({_id:cguid,general:{$exists:false}});
    ctx.assert(csignet,'signet not exists');
    let csignetcfn = global.gameconfig.signet[csignet.gsid];
    ctx.assert(csignetcfn.QUALITY == 6,'signet not quality');

    ctx.csignet = csignet;

    await next();
    let time = moment().format('YYYY-MM-DD HH:mm:ss');

    console.log(ctx.path,ctx.role.uid, ctx.role.rno, ctx.role.servid,cguid+':'+ctx.csignet.gsid,'-->',guid+':'+ctx.signet.gsid,time);
    
    await ctx.csignet.remove();
    ctx.signet.markModified('appraise');
    await ctx.signet.save();
    ctx.body = {
        signet:ctx.signet.base()
    }
    if(general){
		ctx.general = await ctx.role.findGenerals(general);
	}
	if(ctx.general){
		ctx.body.general = ctx.general.base();
	}
    let evnet = ctx.path.split('/');
    evnet = 'EVENT_SIGNET_' + evnet[evnet.length - 1].toUpperCase();
    ctx.role.dispatchEvent(evnet , 1);
}