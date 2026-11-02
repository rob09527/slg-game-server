
'use strict'
const _ = require('lodash');
async function lotteryInfo(ctx, params) {
	let {
		servid,
		uid,
	} = params;
	ctx.lottery = await ctx.dao.lottery.findOne({ expire: { $exists: false }, servid, uid });
	if (!ctx.lottery) {
		let cond = {
			finish: { $exists: 0 },
			areamark: ctx.area.areamark,
			format: 'group',
		}
		let tkrecord = await ctx.dao.topkingrecord.findOne(cond);
		if (!tkrecord) {
			cond.format = 'king';
			tkrecord = await ctx.dao.topkingrecord.findOne(cond);
		}
		ctx.assert(tkrecord, 'no record');
		let battles = [];
		for (let _groupdata of Object.values(tkrecord.standing)) {
			let lastround = _.last(_groupdata);
			let lastbattle = _.last(lastround);
			if (lastbattle.split('_').length < 2) continue;
			battles.push(...lastround);
		}
		ctx.assert(battles.length > 0, 'no battles');
		let myserverbattles = [];
		for (let _battle of battles) {
			let [
				left,
				right,
			] = _battle.split('_');
			left = await ctx.dao.topking.findOne({ mark: left });
			if (left.servid === servid) {
				myserverbattles.push(_battle);
				continue;
			}
			right = await ctx.dao.topking.findOne({ mark: right });
			if (right.servid === servid) {
				myserverbattles.push(_battle);
				continue;
			}
		}
		if (myserverbattles.length < 1) myserverbattles = battles;
		battles.shuffle();
		let choose_battle = battles[0];
		let [
			left,
		] = choose_battle.split('_');
		left = await ctx.dao.topking.findOne({ mark: left });
		ctx.assert(left, 'invalid mark');
		ctx.lottery = await ctx.dao.lottery.create({
			servid,
			uid,
			progress: left.progress,
			battlemark: choose_battle,
		});
	}

	ctx.lotterybattle = await ctx.dao.lotterybattle.findOne({ battlemark: ctx.lottery.battlemark });
	if (!ctx.lotterybattle) ctx.lotterybattle = { left: 0, right: 0 };
	let players = ctx.lottery.battlemark.split('_');
	let tmp = [];
	for (let mark of players) {
		let player = await ctx.dao.topking.findOne({ mark });
		ctx.assert(player, 'player nexist');
		tmp.push({
			servid: player.servid,
			uid: player.uid,
		})
	}
	players = tmp;
	players[0].support = ctx.lotterybattle.left;
	players[1].support = ctx.lotterybattle.right;
	ctx.body = { players }
	if (ctx.lottery.bettime) {
		ctx.body.iswin = ctx.lottery.iswin;
		ctx.body.bettime = ctx.lottery.bettime;
	}
	return ctx.body
}

module.exports = exports = async function (ctx, next) {
	let params = {
		servid: ctx.role.servid,
		uid: ctx.role.uid,
	}

	let data = await lotteryInfo(ctx, params);
	let {
		iswin,
		players,
		bettime,
	} = data;
	let tmp = [];
	for (let { uid, servid, support } of players) {
		let player = await ctx.dao.role.getOtherInfoAndBattleSet({ servid, uid }, 'topkingpvp');
		player.support = support;
		player.servid = servid;
		player.uid = uid;
		if (!bettime) player.pay = ctx.pay;
		tmp.push(player);
	}
	let total = tmp.reduce((cur, nxt) => cur += nxt.support, 0);
	for (let _player of tmp) {
		_player.rate = total > 0 ? _player.support / total : 0;
		delete _player.support;
	}
	if (bettime) {
		let index = iswin ? 0 : 1;
		tmp[index].support = true;
	}
	ctx.body = tmp;
}
