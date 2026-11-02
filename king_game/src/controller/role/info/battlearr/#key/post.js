
'use strict'
const moment = require('moment');
const RANK_KEY = 'pvpdef_power';
module.exports = exports = async (ctx, next) => {
	//rob国战脚本 生产模式屏蔽。脚本释放
	// let result = await global.dao.general.find({ rid: ctx.role.rid })
	// ctx.request.body.battleset = {
	// 	team: { "3": result[0].id, "5": result[1].id },
	// }
	// console.log(ctx.role.uid)
	// ctx.params.key = "pvpdef"
	// console.log(ctx.role.uid)
	//rob国战脚本end


	// 设置王者演武阵容需要检查段位,kingpvp.l0 >= 5(大师以上)才可以设置第二队
	let lv = ctx.role.getProp(38004);
	const config = global.gameconfig.officialitems[lv > global.gameconfig.officialitems.length ? global.gameconfig.officialitems.length - 1 : lv];
	ctx.assert(config && Object.keys(ctx.request.body.battleset.team).length <= config.PEOPLE, "people more than rule")
	const is_kingpvp = ctx.params.key.startsWith('kingpvp');
	const isLegionPvp = ctx.params.key.startsWith('legionpvp'); // 军团战整容设置
	const isWangpvp = ctx.params.key.startsWith('wangpvp'); // 国王站阵容设置
	const isNationwar = ctx.params.key.startsWith('nationwar'); // 国战阵容设置
	if (is_kingpvp) {
		let bsindex = Number.parseInt(ctx.params.key.replace('kingpvp', ''));
		ctx.assert(bsindex <= 3, 'invalid teamindex');
		// 设置第二队时需要检查
		if (bsindex >= 2) {

			const score_card = await ctx.dao.pvpking.findOne({ rid: ctx.role.i() });
			if (score_card.kingpvp) {
				score_card.kingpvp.stage = await score_card.stage();
			}
			ctx.assert(score_card.kingpvp, 'kpdj ing');
			ctx.assert(score_card.kingpvp.stage >= 601, 'cant set');
		}
	}

	if (isLegionPvp) { // 军团战设置
		const teamLength = Object.values(ctx.request.body.battleset.team).filter(Boolean).length;
		// 军团战 注释掉阵营 一定10人的限制
		// ctx.assert( [0, 10].includes( teamLength ), 'legionpvp team length must 10');
		if (teamLength === 0) { // 如果没有设置阵容，则取消该军团阵容
			delete ctx.request.body.battleset.camp;
		} else if (ctx.request.body.battleset.camp) { // 有设置阵营 检测阵营是否合格
			ctx.assert(['top', 'mid', 'down'].includes(ctx.request.body.battleset.camp), 'invalid camp');
		}
		const setCamp = ctx.request.body.battleset.camp;
		// 阵营切换 需检测阵容是否有满,先查出 军团信息
		if (setCamp && (ctx.role.battlearr[ctx.params.key] || {}).camp !== setCamp) {
			ctx.role._legion = await ctx.dao.legion.findOne({ _id: ctx.role.legion }, { _members: 1 });
			ctx.assert(ctx.role._legion, 'no legion cant set camp');
		}

	}
	// 国王设置
	if (isWangpvp) {
		let bsindex = Number.parseInt(ctx.params.key.replace('wangpvp', ''));
		ctx.assert(bsindex <= 1, 'invalid wangbsetindex');
		let SERVER_START = moment(ctx.role._gameserv.groupstart).valueOf();
		// 判断这个服是否可以开启国王战
		ctx.assert(Date.now() > SERVER_START, 'WANGPVP NO OPEN');
		// 判断玩家是否淘汰
		let wangrole = await ctx.dao.wangpvp.findOne({ rid: ctx.role._id });
		ctx.assert(wangrole && !wangrole.isout, 'wangpvp is out');
	}

	await ctx.role.setBattleSet(ctx.params.key, ctx.request.body.battleset);
	if (ctx.params.key === "pvpdef") {
		const rankService = new global.services.RankService(RANK_KEY, ctx.role._gameserv.groupid);
		await rankService.set('' + ctx.role._id, ctx.role._powerbattleset.pvpdef || 0);
	}
	// 国战设置阵容后上传阵容
	if (isNationwar) {
		let bsindex = Number.parseInt(ctx.params.key.replace('nationwar', ''));
		let data = {
			servid: ctx.role.servid,
			uid: ctx.role.uid,
			bsindex
		};
		await ctx.dao.nationwar_battleinfo.regist(data);
	}

	if (is_kingpvp) {
		let bsindex = Number.parseInt(ctx.params.key.replace('kingpvp', ''));
		bsindex--;
		let data = {
			servid: ctx.role.servid,
			uid: ctx.role.uid,
			bsindex
		}
		ctx.dao.pvpking.register(ctx.role.servid, ctx.role.uid, ctx.role.i()).catch(console.error);
	}
	if (ctx.params.key.startsWith('ringpvp3')) {
		// 如果是设置 擂台第3队，进行报名擂台
		let data = {
			servid: ctx.role.servid,
			rid: ctx.role.i(),
			level: ctx.role.level,
			imageid: ctx.role.imageid,
			frameid: ctx.role.frameid,
			headid: ctx.role.headid,
			power: ctx.role._power,
			name: ctx.role.name,
			honor_value: ctx.role.honor_value,
		}
		await ctx.dao.ringrank.join(data);
	}
	ctx.body = {};
}
