/**
 * 先锋召唤,关卡抽卡
 */

'use strict'

const debug_default = function(uid, ...args) {
	args = ['VANGUARD_ROLL', uid, ...args];
	console.error.apply(null, args);
}

const basePool = function(role) {
	return global.gameconfig.vanguard_general[0].filter(({MINLV, MAXLV, MINVIP, MAXVIP}) =>{
		return role.level >= MINLV
				&& role.level < MAXLV
				&& role.vip >= MINVIP
				&& role.vip <= MAXVIP;
	})
}

module.exports = async ctx =>{
	// let debug = debug_default.bind(null, ctx.role.uid);
	let {
		force,
	} = ctx.request.body;
	// 返回预览武将信息
	if (ctx.record.generals.length >= 10 && !force) {
		ctx.body = ctx.record.generals;
		return;
	}
	/**
	 * 抽武将逻辑
	 * 1.单次最多抽出3个5星武将
	 * 2.单次最多抽出一个品质7武将
	 */
	let generallist = [];
	let star5_counter = 0;
	let quality7_counter = 0;
	let pool = basePool(ctx.role);
	while(generallist.length < 10) {	// 5星超指定个数会continue,所以使用while
		// 随机指定星级
		let star = ctx.random.inweight(global.gameconfig.vanguard_other.STAR_W) + 3;
		if (star >= 5 && star5_counter >= 3) continue;	// 最多3个5星武将
		let _pool = [...pool];
		// 筛选出指定星级武将池
		_pool = _pool.filter(general =>{
			return general.STAR === star;
		})
		if (quality7_counter >= 1) {
			_pool = _pool.filter(general =>{
				return general.QUALITY < 7;
			})
		}
		let rates = _pool.deepMap('W');
		let general = _pool[ctx.random.inweight(rates)];
		ctx.assert(general, 'config err');
		if (general.STAR >= 5) star5_counter++;	// 记录抽到5星武将
		let bGSID = true;
		if (general.QUALITY >= 7) {
			quality7_counter++; // 记录抽到品质7武将
			if(ctx.role.getItems(90655).count > 0) {
				// 第一次7资质武将，指定随机
				ctx.role.castItemsNoSave({gsid: 90655, count: 1});
				let quality7 = global.gameconfig.vanguard_general[7];
				let index = ctx.random.between(0, quality7.length - 1);
				if(quality7[index]){
					generallist.push(quality7[index]);
					bGSID = false;
				}
			}
		}
		if(bGSID){
			generallist.push(general.GSID);
		}
	}
	// 保存
	await ctx.record.updateOne({$set: {generals: generallist}});
	ctx.record.generals = generallist;
	ctx.body = generallist;
	// 玩家标记增加
	ctx.role.addItemsNoSave({gsid: 93127, count: 10});	// 抽卡次数标记
	await ctx.role.save();
}
