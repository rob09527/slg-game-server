
'use strict'

const {
	CAST_ITEMS,
	DROP_ITEMS,
} = global.gameconfig.others.SPIN;
const { hitHere } = require("../../../../util/weektarget");

module.exports = exports = async (ctx, next) =>{
	// 检查缓存数据
	ctx.assert(ctx.cache, 'no items');
	// 周活动开始与结束的时候refresh会设置为1;
	// 一般用户重新请求进去刷新商品即可。防止用户停留在页面里,利用活动时间到期而前端未请求spin/get接口刷新商品进而能一直抽缓存道具的bug;
	ctx.assert(ctx.cache.refresh !== 1, 'need refresh');
	const times = parseInt(ctx.request.body.times) || 1;
	let coincast ;
	let getcoin;
	let score = times;
	if (ctx.stype === 'normal') { // 自动购买观星币
		score *= 1;
		if (ctx.role.getProp(30008) < times){
			let res = ctx.khexec(ctx.role, 'spincoin_0', times);
			coincast = res.castitems;
			getcoin = res.items;
		}
	} else { // 自动购买观星币
		score *= 10;
		if (ctx.role.getProp(30009) < times){
			let res = ctx.khexec(ctx.role, 'spincoin_1', times);
			coincast = res.castitems;
			getcoin = res.items;
		}
	}
	let [ok, season, _] = ctx.role.isInPanda("xyxc");
	if (ok){
		// 有可能是从快捷入口进入，没有获取观星活动数据
		if (!ctx.role.panda) ctx.role.panda = {}
		let d = ctx.role.panda.xyxc;
		if (!d || d.season != season){
			ctx.role.panda.xyxc = {
				score: 0,
				season: season
			};
		}
		score += ctx.role.panda.xyxc.score;
		ctx.role.panda.xyxc.score = score;
		ctx.role.markModified('panda');
		let rankService = new global.services.RankService('panda-gxbd', ctx.role._gameserv.groupid);
		await rankService.set({
			id: ctx.role.i(),
			score: score
		});
	}
	// 计算消耗
	const cast = CAST_ITEMS[ctx.stype].map(function (item) {
		let tmp = {gsid: item.gsid, count: item.count * times};
		if (item.every && times >= item.every.time) tmp.count = tmp.count - Math.floor(tmp.count / item.every.time) * item.every.minus;
		return tmp;
	})
	ctx.role.castItemsNoSave(cast, 'spin');
	ctx.body = [];
	let drop = [];
	let first_pos;
	let record_save = [];
	const SAFE_EIGHT_TIMES = global.gameconfig.others.SPIN['SAFE_EIGHT_TIMES_' + ctx.stype[0].toUpperCase()];
	for (let i = 0; i < times; i++) {
		let item;
		if (!ctx.cache.isRareGet()) ctx.cache.rolltimes++;
		// 保底
		if (!ctx.cache.isRareGet() && SAFE_EIGHT_TIMES && ctx.cache.rolltimes >= SAFE_EIGHT_TIMES) {
			item = ctx.cache.items[7];
		}else{
			const items = ctx.cache.items.filter(function (item) {
				return !item.SELL;
			});
			const rates = items.deepMap('CHANCE');
			item = items[ctx.random.inweight(rates)];
		}
		// set item sold
		if (!item.REPEAT) item.SELL = 1;
		ctx.assert(item, 'random err');

		// 保存记录
		const index = ctx.cache.items.indexOf(item);
		if (index > 3) {
			record_save.push(ctx.dao.spinrecord.create({
				rid: ctx.role._id,
				type: ctx.stype,
				gsid: item.GSID,
				count: item.COUNT,
			}))
		}

		// 返回第一个物品的下标
		if (i == 0) first_pos = index;

		// 固定掉落获取
		let out = DROP_ITEMS[ctx.stype].map(function (item) {
			return {gsid: item.gsid, count: ctx.random.between(item.min, item.max)};
		})
		drop = drop.append(out);
		ctx.body.push({gsid: item.GSID, count: item.COUNT});
	}
	drop = drop.arrange();
	ctx.body = ctx.body.append(drop);

	ctx.role.addItemsNoSave(ctx.body, 'spin');
	ctx.cache.markModified('items');
	// 探囊取物(周活动)
	let type = Number.parseInt(ctx.request.body.type || 1) - 1;
	await ctx.zhdpoint('TNQW', ctx.role, times, type);
	// 七日目标-观星次数
	hitHere(ctx.role, 94210, times, true);
	// 观星次数
	ctx.role.missionInvoke(`GUANXIN_${ctx.stype.toUpperCase()}_DAILY_HISTORY`, times);
	ctx.role.dispatchEvent('EVENT_GUANXIN_' + ctx.stype.toUpperCase(), times );
	// 观星达标
	if (ctx.stype === 'premium') {

		ctx.zhdpoint('SDBJ_POINT',ctx.role,98201); //圣诞笔记-高级观星
		ctx.zhdpoint('ZJD_POINT',ctx.role,98306); //欢乐砸金蛋-高级观星

		ctx.jfhd({name: 'gxdb', role: ctx.role, times},1).catch(console.error);
	}
	// 跑马灯
	ctx.role.bulletScreen("SPIN", ctx.body);
	// 职业任务
	if (ctx.stype === 'normal') ctx.jobtask({mark:90380, rid: ctx.role._id, times}, 1).catch(console.error);

	await ctx.role.save();
	await Promise.all([Promise.all(record_save), ctx.cache.save()]);
	let castitems = cast;
	if (coincast){
		cast.push(...coincast);
		cast.push(...getcoin.map(g => { g.COUNT = -g.COUNT; return g}));
		castitems = cast.arrange();
	}
	ctx.body = {pos: first_pos, items: ctx.body, castitems};
	await ctx.role.zhenbaoMissionInvoke({missionName: `GUANXIN_${ctx.stype.toUpperCase()}`, count: times});
	// 打印招募消耗元宝数量日志
	ctx.khlog.ybcastprint('spin', ctx.role.uid, cast);
}
