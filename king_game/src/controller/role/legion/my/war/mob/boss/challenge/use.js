
'use strict'

const _ = require('lodash');

const {
	LEGION: {
		WARBOSS: {
			CHALLENGE_CAST,
		},
	},
} = global.gameconfig.others;

module.exports = exports = async function (ctx, next) {
	ctx.body = {};
	let {
		times = 1,
	} = ctx.request.body;
	times = Number.parseInt(times);
	// 最少一次
	times = Math.max(times, 1);
	let config = global.gameconfig.legionwarmobboss.deepQueryOne('SEASON', ctx.bseason().season);
	ctx.assert(config, 'invalid boss');
	// 获取挑战信息
	let info = ctx.boss.roles.deepQueryOne('rid', ctx.role.i());
	if (!info) {
		info = {
			rid: ctx.role.i(),
			lastdamage: 0,
			totaldamage: 0,
			num: 0,
		}
		ctx.boss.roles.push(info);
	}
	// 消耗
	ctx.assert(info.num < CHALLENGE_CAST.length, 'nmore chance');
	ctx.assert(info.num + times <= CHALLENGE_CAST.length, 'over chance');
	// 传递给后面方法使用
	ctx.myinfo = info;
	ctx.times = times;
	let ybnum = 0;
	for (let i = info.num; i < info.num + times; i++) {
		ybnum += CHALLENGE_CAST[i];
	}
	if (ybnum > 1) ctx.role.castItemsNoSave({gsid: 38005, count: ybnum});
	await next();
	info.num += times;
	let {
		CREWARD,
		STAGE,
	} = config;
	// 挑战奖励
	let items = [];
	for (let i = 0; i < times; i++) {
		let _items = CREWARD.map(({GSID, MINCOUNT, MAXCOUNT}) => {
			return {
				GSID,
				COUNT: ctx.random.between(MINCOUNT, MAXCOUNT),
			}
		})
		items.push(..._items);
	}
	items = items.arrange();
	ctx.body.items = items;
	ctx.role.addItemsNoSave(items);
	let mails = [];
	for (let [i, info] of Object.entries(STAGE)) {
		if (ctx.boss.stagefinish[i]) continue;
		let {
			DAMGE,
			REWARD,
		} = info;
		if (ctx.boss.totaldamage < DAMGE) break;
		// 阶段达成
		ctx.boss.stagefinish.push({
			rid: ctx.role.i(),
			time: Date.now(),
		})
		mails.push(REWARD);
	}
console.error(JSON.stringify(mails));
	// 是否有达成奖励
	if (mails.length > 0) {
		let rids = await ctx.dao.role.find({legion: ctx.legion._id}, {_id: 1});
		rids = rids.map(({_id}) => _id.toString());
console.error({rids});
		mails = mails.map(reward => {
			return rids.map(rid =>{
				return {
					type: 2,
					rid,
					reward,
					title: ctx.textgetter('LEGION_WARMOB_BOSS_KILL_T'),
					content: ctx.textgetter('LEGION_WARMOB_BOSS_KILL_C'),
				}
			})
		})
	}
	mails = _.flattenDeep(mails);
	// 邮件发放
	if (mails.length > 0) await ctx.dao.mail.insertMany(mails);
	ctx.boss.markModified('roles');
	ctx.boss.update = Date.now();
	await ctx.boss.save();
	await ctx.role.save();
}