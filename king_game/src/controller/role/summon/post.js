
'use strict'

const CAMP_TYPE = ['wei', 'shu', 'wu', 'qx', 'dm'];
const CAMP_MARK = {
	"wei": 90451,
	"shu": 90452,
	"wu": 90453,
	"qx": 90454,
	"dm": 90455,
}

const { hitHere } = require("../../../util/weektarget");

module.exports = exports = async (ctx, next) =>{
	ctx.hook.pre(EVENT_ENUM.DRAW);
	const type = CAMP_TYPE[(parseInt(ctx.request.body.type) || 1) - 1];

	let config = global.gameconfig['summon'+type];
	ctx.assert(config, 'invalid type0');

	let {CAST_ITEMS} = global.gameconfig.others.SUMMON;
	CAST_ITEMS = CAST_ITEMS[type.toUpperCase()];
	ctx.assert(CAST_ITEMS, 'invalid type1');

	config = config.filter(function (item) {
		return (ctx.role.level >= item.MINLV && ctx.role.level <= item.MAXLV) &&
		(ctx.role.vip >= item.MINVIP && ctx.role.vip <= item.MAXVIP);
	})
	const rates = config.deepMap('CHANCE');
	const times = parseInt(ctx.request.body.times) || 1;
	let pieces = [];
	let drops = [];
	for (let i = 0; i < times; i++) {
		const item = config[ctx.random.inweight(rates)];
		ctx.assert(item, 'invalid item');
		pieces.push({
			gsid: item.ID,
			count: ctx.random.between(item.MIN, item.MAX),
		});
		const drop = CAST_ITEMS.DROP.map(function (item) {
			return {
				gsid: item.GSID,
				count: ctx.random.between(item.MIN, item.MAX),
			}
		})
		drops.push(...drop);
	}
	// 10连抽保底逻辑
	if (times === 10) {
		// 检查是否有必出武将
		let ensurelist = config.deepQuery('ENSURE', 1);
		let bingo = false;
		for (let {ID} of ensurelist) {
			for (let {gsid} of pieces) {
				if (ID !== gsid) continue;
				bingo = true;
				break;
			}
			if (bingo) break;
		}
		// 没抽中必出武将则直接给一份
		if (!bingo) {
			pieces.pop();
			let rates = ensurelist.deepMap('CHANCE');
			let item = ensurelist[ctx.random.inweight(rates)];
			pieces.push({
				gsid: item.ID,
				count: ctx.random.between(item.MIN, item.MAX),
			})
		}
	}
	ctx.body = [...pieces, ...drops].arrange();
	const cast = CAST_ITEMS.ITEMS.map(function (item) {
		return {gsid: item.GSID, count: item.COUNT * times};
	})
	ctx.role.castItemsNoSave(cast, 'summon');
	ctx.role.addItemsNoSave(ctx.body);
	// 玩家历史阵营点将次数
	ctx.role.addItemsNoSave({ GSID: CAMP_MARK[type], COUNT: times });

	ctx.role.dispatchEvent('EVENT_DJ_' + type.toUpperCase(), times, {}, true);
	// 七日目标-点将次数
	hitHere(ctx.role, 94213, times, true);
	// 积分宝箱-点将积分
	ctx.zhdpoint("JFBX", ctx.role, times, 90352);
	ctx.zhdpoint("ZJD_POINT", ctx.role,98309,times);//欢乐砸金蛋-点将任务
	// 跑马灯
	ctx.role.bulletScreen("SUMMON", ctx.body);
	// 点将积分
	await ctx.jfhd({name: 'djjf', role: ctx.role, times}, 1).catch(console.error);

	await ctx.role.missionInvoke('DIANJIANG', times).save();
	// 珍宝增幅任务
	await ctx.role.zhenbaoMissionInvoke({missionName: 'DIANJIANG', count: times});

	//限时抽将增加积分
	let [ok, _season, id, _t1, _t2, arg] = ctx.role.isInPanda("XSCJ");
	if (ok && (arg == 0 || arg == 2)) {
		let rank = "panda-xscj" + arg + id;
		let rankService = new global.services.RankService(rank, ctx.role._gameserv.groupid);
		let score = await rankService.getItemScore(ctx.role.i())
		await rankService.set({
			id: ctx.role.i(),
			score: times * 12 + score
		});
	}
}
