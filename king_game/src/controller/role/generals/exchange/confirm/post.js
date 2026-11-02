
'use strict'

const moment = require('moment');
const gConfig = global.gameconfig.general;
const { smsHit } = require("../../../../../util/event/smanskin")


module.exports = exports = async (ctx, next) =>{
	ctx.assert(ctx.exchange, 'invalid exchange');
	ctx.general = await ctx.role.findGenerals(ctx.request.body.guid);
	ctx.assert(ctx.general, 'general nexist');
	let log = [ctx.general.gsid, ctx.exchange.gsid];
	let [old_gsid, new_gsid] = log;
	
	let destiny = ctx.role.destiny.general.findIndex(value=>value.guid == old_gsid);
	if (destiny > -1) {
		ctx.role.destiny.general[index].guid = new_gsid;
		ctx.role.markModified('destiny.general');
	}
	if (parseInt(ctx.request.body.confirm)) {
		await ctx.dao.general.updateOne({_id:ctx.request.body.guid},{$unset:{skin:1}});
		ctx.general = await ctx.role.findGenerals(ctx.request.body.guid);
		ctx.general.gsid = ctx.exchange.gsid;
		// 去除原武将身上的皮肤id
		let { IMAGEID, HEADID } = gConfig[ctx.general.gsid];
		// 获得新的武将头像和形象
		if (!ctx.role._heads[HEADID]) ctx.role._heads[HEADID] = -1;
		if (!ctx.role._images[IMAGEID]) ctx.role._images[IMAGEID] = -1;
		ctx.role.markModified('_heads');
		ctx.role.markModified('_images');
		// 获得新图鉴
		const icons = new Set(ctx.role._icons.split('|'));
		if(!icons.has(new_gsid.toString())) {
			icons.add(new_gsid);
			ctx.role._icons = Array.from(icons).join("|");
			ctx.role.markModified('_icons');
		}
		// 代言人皮肤活动埋点
		smsHit(ctx.role, new_gsid);
		await ctx.role.save();
	}
	else if (destiny > -1){
		await ctx.role.save();
	}
	await ctx.general.save();
	await ctx.exchange.remove();
	let time = moment().format('YYYY-MM-DD HH:mm:ss');
	console.log(ctx.role.uid, ctx.role.rno, ctx.role.servid, 'CST', old_gsid, 1, time, -1, ctx.path);
	console.log(ctx.role.uid, ctx.role.rno, ctx.role.servid, 'ADD', new_gsid, 1, time, -1, ctx.path);
	console.log('GENERAL', 'EXCHANGE', ctx.role.servid, ctx.role.uid, ctx.general._id.toString(), ctx.general.class, ctx.general.level, old_gsid, '=>', new_gsid, time);
}