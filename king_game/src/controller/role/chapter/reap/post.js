
'use strict'

module.exports = exports = async (ctx) =>{
	const kingdom = await ctx.dao.c_kingdom.findOne({'standings': ctx.role.i()}, {standings: 1});
	if (kingdom){
		let index = kingdom.standings.indexOf(ctx.role.i());
		ctx.role._kingdom_rank = index;
	}
	ctx.body = ctx.role.reapNoSave(ctx.reaptime, ctx.isKZ);
	let items = ctx.role.gain_cache.append(ctx.body).arrange();

	ctx.role.addItemsNoSave(items, {main: 'chapter', sec: 'hang'});
	ctx.role.gain_cache = [];
	ctx.role.lastreap = ctx.backlastreap || ctx.role.lastreap; // @author awko debug 的征收领取不修改最终征收时间
	ctx.body = {items, castitems: ctx.castitems, lastreap: ctx.role.lastreap, reaptime: ctx.reaptime };
	ctx.role.markModified('gain_cache');
	const {items: configRewards} = ctx.role.reapRewardNoSave(60 * 1000);
	ctx.body.config = configRewards; // 把一分钟收益返回给客户端
	if (ctx.ad) {
		ctx.role.addItemsNoSave({GSID:90738, count:1});
		ctx.body.ad_count = ctx.role.getProp(90738);
		await ctx.role.save();
		return;
	}
	if(ctx.backlastreap){ // 有设置 backlastreap 表示为 日常快战收益
		await ctx.role.missionInvoke('KUAIZAN_DAILY_HISTORY').save();
	}else {
		ctx.role.missionInvoke('GUAJIHISTORY');
		await ctx.role.missionInvoke('GUAJIDAILY').save();
		ctx.role.dispatchEvent('EVENT_REAP');
	}
	// 珍宝任务
	const zbmissionlist = [
		// 珍宝增幅任务-累计挂机获取武将经验
		[30001, 'GUAJI_GEXP_GET'],
		// 珍宝增幅任务-累计挂机获取铜钱
		[38006, 'GUAJI_COIN_GET'],
		// 珍宝增幅任务-累计挂机获取进阶石
		[30015, 'GUAJI_JJS_GET'],
	]
	for (const [tgsid, mname] of zbmissionlist) {
		for (let {GSID: gsid, COUNT: count} of items) {
			if (gsid !== tgsid) continue;
			await ctx.role.zhenbaoMissionInvoke({missionName: mname, count});
		}
	}
	if (ctx.isKZ) await ctx.role.zhenbaoMissionInvoke({missionName: 'KUAIZHAN', count: 1});
}
