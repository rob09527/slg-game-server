
'use strict'

const _ = require('lodash');
const configitem = require('../../../../util/configitem');

const NO_SELF_RANK = [
	'legion',
	'pvpstage',
	'pvpteam',
]

const SELECT_SET = {
	PVP: {
		rno: 1, rname: 1, 'hide.38001': 1,
		iconid: 1, _power: 1, headid: 1,
		frameid: 1,
		pvpscore: 1,
	},

}
const clientRankItem = function (sysconfig) {
	for (let x in sysconfig) {
		let config = sysconfig[x]
		sysconfig[x]['item'] = configitem(config)
	}
	return sysconfig
}


module.exports = exports = async ctx => {
	let {
		rank,
	} = ctx.request.body;
	ctx.assert(rank, 'miss params rank');
	let groupid;
	let is_multi_svr = false;	// 是否跨服
	if (rank === 'pvpking' || rank === 'pvpstage') {
		//  排行会使用王者专用的服务器组
		groupid = await ctx.dao.kinggroup.findOne({ servid: ctx.role.servid });
		groupid = groupid ? groupid.groupmark : 'def';
		is_multi_svr = await ctx.dao.kinggroup.countDocuments({ groupmark: groupid });
		is_multi_svr = is_multi_svr > 1 ? true : false;
	} else if (rank === 'pvpteam') {
		//  排行会使用王者专用的服务器组
		groupid = await ctx.dao.kinggroup.findOne({ servid: ctx.role.servid });
		groupid = groupid ? groupid.groupmark : 'def';
		let rankService = new global.services.RankService(rank, groupid);
		let list = await rankService.rank(1, 50);
		let teamlist = list.map(({ id }) => id);
		teamlist = await ctx.dao.pvpteam.find({ _id: { $in: teamlist } });
		let teams = {};
		for (let team of teamlist) {
			teams[team._id] = await team.base();
		}
		list = list.map(({ id, score }) => {
			let teaminfo = teams[id];
			if (!teaminfo) return;
			delete teaminfo.targets;
			return { ...teaminfo, score, id };
		}).filter(Boolean);
		let selfrank = ctx.role.teamid ? (await rankService.getItemRank(ctx.role.teamid)) : null;
		let selfscore = ctx.role.teamid ? (await rankService.getItemScore(ctx.role.teamid)) : 0;
		ctx.body = {
			list
		}
		if (selfrank) ctx.body.selfrank = selfrank;
		if (selfscore) ctx.body.selfscore = selfscore;
		return ctx.body;
	}
	// 奇门幻阵排行
	else if (rank === 'fantasy') {
		//  排行会使用巅峰赛专用的服务器组
		groupid = await ctx.dao.fantasyboss.findOne({ rid: ctx.role.i() }, { areamark: 1 });
		if (!groupid) {
			groupid = await ctx.dao.topkingservergroup.findOne({ servid: ctx.role.servid });
		}
		groupid = groupid ? groupid.areamark : 'default';
	} else if (rank === 'pvp3vs3') {
		let key = "pvp3vs3"
		let rankService = new global.services.RankService(key);
		let list = await rankService.rank(1, 50);
		let roles = list.map(({ id }) => id);
		let select = SELECT_SET[rank.toUpperCase()];
		roles = await ctx.dao.role.find({ _id: { $in: roles } }, select);
		const tmp = {};
		roles.forEach(one => {
			tmp[one._id.toString()] = one;
		})
		let selfrank = await rankService.getItemRank(ctx.role.i());
		let selfscore = await rankService.getItemScore(ctx.role.i());
		let maxrank = 500
		list = list.map(({ id, score, rank }) => {
			let role = tmp[id];
			if (!role) return;
			let servid = role.servid;
			return {
				rid: role.i(),
				rname: role.name,
				iconid: role.iconid,
				frameid: role.frameid,
				headid: role.headid,
				power: role._power,
				level: role.level,
				rank: rank,
				servid,
				score,
			}
		}).filter(Boolean);
		ctx.body = {
			list
		}
		if (selfrank <= maxrank) {
			ctx.body.selfrank = selfrank
		}
		if (selfscore) {
			ctx.body.selfscore = selfscore;
		}
	} else if (rank === 'topup') {
		let id = "czphb"
		let key = (`${id}-${global.gameconfig[id][0][1].key}`)
		let rankService = new global.services.RankService(key);
		let list = await rankService.rank(1, 30);
		let roles = list.map(({ id }) => id);
		let select = SELECT_SET[rank.toUpperCase()];
		roles = await ctx.dao.role.find({ _id: { $in: roles } }, select);
		const tmp = {};
		roles.forEach(one => {
			tmp[one._id.toString()] = one;
		})
		// await global.remote.proxy_getlanguage()
		//统一cn 
		const lang = await global.remote.proxy_getlanguage()
		let sysconfig = global.gameconfig[id][0]
		let selfrank = await rankService.getItemRank(ctx.role.i());
		let selfscore = await rankService.getItemScore(ctx.role.i());
		let useritem = []
		let rankoverflow = []
		let rankoverflowsorce = 0
		let maxrank = 0
		list = list.map(({ id, score, rank }) => {
			let role = tmp[id];
			if (!role) return;
			let servid = role.servid;
			let sysrankconfig
			let failconfig
			let failscore
			for (let x in sysconfig) {
				let config = sysconfig[x]
				let limtscore = config[lang.toLocaleLowerCase()]
				if (config.min <= rank && rank <= config.max) {
					sysrankconfig = config
				}
				if (score >= limtscore) {
					if (!failscore || failscore <= limtscore) {
						failconfig = config
						failscore = limtscore
					}
				}

				if (selfscore >= limtscore && limtscore > rankoverflowsorce) {
					rankoverflowsorce = limtscore
					rankoverflow = configitem(config)
				}
				if (config.max > maxrank) {
					maxrank = config.max
				}

			}
			let item = configitem(sysrankconfig)
			let limtscore = sysrankconfig[lang.toLocaleLowerCase()]
			if (selfrank == rank) {
				useritem = configitem(sysrankconfig)
				if (score < limtscore && failconfig) {
					useritem = configitem(failconfig)
				}
			}

			return {
				rid: role.i(),
				rname: role.name,
				iconid: role.iconid,
				frameid: role.frameid,
				headid: role.headid,
				power: role._power,
				level: role.level,
				item: item,
				servid,
				score,
			}
		}).filter(Boolean);

		ctx.body = {
			list,
			config: clientRankItem(sysconfig)
		}
		if (selfrank <= maxrank) {
			ctx.body.selfrank = selfrank
			if (useritem) {
				ctx.body.useritem = useritem
			} else if (rankoverflow) {
				ctx.body.useritem = rankoverflow
			} else {
				ctx.body.useritem = []
			}
		}
		if (selfscore) {
			ctx.body.selfscore = selfscore;
		} else {
			let score = Math.ceil(ctx.role.getItems(global.gameconfig[id][0][1].key).count) ? Math.ceil(ctx.role.getItems(global.gameconfig[id][0][1].key).count) : 0
			ctx.body.selfscore = score;
		}
		ctx.body.lang = lang
		return ctx.body
	} else if (rank === 'pushmap') {
		let rankService = new global.services.RankService('pushmap', ctx.role.servid);
		let list = await rankService.rank(1, 30);
		let roles = list.map(({ id }) => id);
		let select = SELECT_SET[rank.toUpperCase()];
		roles = await ctx.dao.role.find({ _id: { $in: roles } }, select);
		const tmp = {};
		roles.forEach(one => {
			tmp[one._id.toString()] = one;
		})
		let sysconfig = global.gameconfig.kftt
		let selfrank = await rankService.getItemRank(ctx.role.i());
		let selfscore = await rankService.getItemScore(ctx.role.i());
		let useritem = []
		let maxrank = 0
		list = list.map(({ id, score, rank }) => {
			let role = tmp[id];
			if (!role) return;
			let servid = role.servid;
			let sysrankconfig

			for (let x in sysconfig) {
				let config = sysconfig[x]
				if (rank >= config.MIN && rank <= config.MAX) {
					sysrankconfig = config
				}
				if (config.max > maxrank) {
					maxrank = config.max
				}
			}

			let item = sysrankconfig.item
			if (selfrank == rank) {
				useritem = item
			}

			return {
				rid: role.i(),
				rname: role.name,
				iconid: role.iconid,
				frameid: role.frameid,
				headid: role.headid,
				power: role._power,
				level: role.level,
				item: item,
				servid,
				score,
			}
		}).filter(Boolean);

		ctx.body = {
			list
		}
		ctx.body.selfrank = selfrank
		ctx.body.useritem = useritem
		ctx.body.selfscore = selfscore ? selfscore : 0;
		return ctx.body
	} else if (rank === 'xhycz') {
		let id = "xhyxhb"
		groupid = ctx.role._gameserv.groupid;
		let key = (`${id}-${global.gameconfig[id][0][1].key}`)
		let rankService = new global.services.RankService(key, groupid);
		let list = await rankService.rank(1, 50);
		let roles = list.map(({ id }) => id);
		let select = SELECT_SET[rank.toUpperCase()];
		roles = await ctx.dao.role.find({ _id: { $in: roles } }, select);
		let sysconfig = global.gameconfig[id][0]
		let selfrank = await rankService.getItemRank(ctx.role.i());
		let selfscore = await rankService.getItemScore(ctx.role.i());
		const tmp = {};
		let useritem = []
		roles.forEach(one => {
			tmp[one._id.toString()] = one;
		})
		let rankoverflow = []
		let rankoverflowsorce = 0
		let maxrank = 0

		list = list.map(({ id, score, rank }) => {
			let role = tmp[id];
			if (!role) return;
			let servid = role.servid;
			let sysrankconfig
			let failconfig
			let failscore
			for (let x in sysconfig) {
				let config = sysconfig[x]
				let limtscore = config.limit
				if (config.min <= rank && rank <= config.max) {
					sysrankconfig = config
				}
				if (score >= limtscore) {
					if (!failscore || failscore <= limtscore) {
						failconfig = config
						failscore = limtscore
					}
				}
				if (selfscore >= limtscore && limtscore > rankoverflowsorce) {
					rankoverflowsorce = limtscore
					rankoverflow = configitem(config)
				}
				if (config.max > maxrank) {
					maxrank = config.max
				}

			}
			let item = configitem(sysrankconfig)
			let limtscore = sysrankconfig.limit
			if (selfrank == rank) {
				useritem = configitem(sysrankconfig)
				if (score < limtscore && failconfig) {
					useritem = configitem(failconfig)
				}
			}
			return {
				rid: role.i(),
				rname: role.name,
				iconid: role.iconid,
				frameid: role.frameid,
				headid: role.headid,
				power: role._power,
				level: role.level,
				item,
				servid,
				score,
			}
		}).filter(Boolean);

		ctx.body = {
			list,
			config: clientRankItem(sysconfig)
		}
		if (selfrank <= maxrank) {
			ctx.body.selfrank = selfrank
			if (useritem) {
				ctx.body.useritem = useritem
			} else if (rankoverflow) {
				ctx.body.useritem = rankoverflow
			} else {
				ctx.body.useritem = []
			}
		}
		if (selfscore) {
			ctx.body.selfscore = selfscore;
		} else {
			let score = Math.ceil(ctx.role.getItems(global.gameconfig[id][0][1].key).count) ? Math.ceil(ctx.role.getItems(global.gameconfig[id][0][1].key).count) : 0
			ctx.body.selfscore = score;
		}
		return ctx.body

	} else {
		groupid = ctx.role._gameserv.groupid;
	}
	let rankService = new global.services.RankService(rank, groupid);
	let list = await rankService.rank(1, 50);
	let roles = list.map(({ id }) => id);
	let select = SELECT_SET[rank.toUpperCase()];
	if (!select) {
		select = {}
	}
	select.titleid = 1
	roles = await ctx.dao.role.find({ _id: { $in: roles } }, select);
	const tmp = {};
	roles.forEach(one => {
		tmp[one._id.toString()] = one;
	})
	list = list.map(({ id, score }) => {
		let role = tmp[id];
		if (!role) return;
		let bsetpower = undefined;
		let servid = role.servid;
		if (rank == 'pvpstage') {
			bsetpower = role.getBattlePower('kingpvp')
		}
		return {
			rid: role.i(),
			rname: role.name,
			iconid: role.iconid,
			frameid: role.frameid,
			headid: role.headid,
			power: role._power,
			bsetpower: bsetpower,
			level: role.level,
			titleid: role.titleid,
			servid,
			score,
		}
	}).filter(Boolean);

	let selfrank = await rankService.getItemRank(ctx.role.i());
	let selfscore = await rankService.getItemScore(ctx.role.i());
	let l7_num = is_multi_svr ? 30 : 10;	// 跨服王者30名,单服10名
	if (rank === 'pvpstage') {
		for (let i = 0; i < l7_num; i++) {
			let _obj = list[i];
			if (!_obj) break;
			let pvpking = await ctx.dao.pvpking.findOne({ servid: _obj.servid, rid: _obj.rid });
			if (pvpking) {
				if (pvpking.kingpvp) _obj.star = pvpking.kingpvp.star;
				_obj.stage = await pvpking.stage();
			}
			if (_obj.score < 500) continue;	// 非大师l0<5不处理
			_obj.score += 100;	// 5xx->7xx,大师硬改成王者
		}
	}
	ctx.body = {
		list,
	}
	if (selfrank) ctx.body.selfrank = selfrank;
	if (selfscore) {
		// 王者演武额外加100
		if (selfrank < l7_num && rank === 'pvpstage') selfscore += 100;
		ctx.body.selfscore = selfscore;
	}
}
