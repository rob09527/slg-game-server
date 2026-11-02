const tg = require('../textgetter');
const utilCursor = require("../cursor");
const _ = require('lodash');
const moment = require("moment");
const getBeforWeekDays = require('./getBeforWeekDays');

module.exports = async function (key, isws) {
	key = isws ?  `xs_${key}` : key;
	let {
		REFMARKS,
		CLEANMARKS,
		MISSIONS,
		MARK,
		LOOPLIMIT,
	} = global.gameconfig.zhd[  key.toUpperCase()  ] || {};

	// 邮件发放尚未领取的奖励
	let cond = {
		[`others.${MARK}`]: {
			$exists: 1,
		},
	};
	if(isws){
		// const day = moment().add(-global.gameconfig.others.NEW_ROLE_DAYS, 'days');
		// // 新手清理 查询7天前(NEW_ROLE_DAYS=7)的那一天注册的角色
		// cond.create = {
		// 	$gte: day.startOf('days').valueOf(),
		// 	$lte: day.endOf('days').valueOf()
		// }
		cond.$or = getBeforWeekDays();
	} else {  // 新手保护，注册未到7天的不会玩到正式活动
		cond.create = {
			$lte: moment().add(-7, 'days').startOf('days').valueOf()
		}
	}

	let mails = [];

	await utilCursor( global.dao.role.find(cond, { others: 1, hide: 1 }), async (role)=> {
		let looplimit = LOOPLIMIT[role.vip];
		let cycleScore = _.last(MISSIONS).NUM;
		let curScore = role.getProp(MARK);
		curScore = Math.min(curScore, looplimit * cycleScore);
		let nowLoop = Math.min(Math.trunc(curScore / cycleScore), looplimit - 1);
		let reward = [];
		for (let curloop = 0; curloop <= nowLoop; curloop++) {
			let markNums = MISSIONS.map(({ MARK }) => role.getProp(MARK));
			for (let i = 0; i < MISSIONS.length; i++) {
				let {NUM, ITEMS,SELECTITEMS } = MISSIONS[i];
				let markNum = markNums[i];
				if (markNum > curloop) continue;
				let needScore = cycleScore * curloop + NUM;
				if (needScore > curScore) break;
				reward.push(...ITEMS);
				if (SELECTITEMS && SELECTITEMS[0]) {
					reward.push(SELECTITEMS[0]);
				}
				markNums[i] += 1;
			}
		}
		if (reward.length < 1) return;
		reward = reward.arrange();
		const base_key = key.replace('xs_', '');
		mails.push({
			type: 2,
			rid: role._id,
			title: tg(`${base_key.toUpperCase()}_RETURN_T`),
			content: tg(`${base_key.toUpperCase()}_RETURN_C`),
			reward,
		})

		if (mails.length > 1000) {
			await global.dao.mail.insertMany(mails).catch(console.error);
			mails.splice(0, mails.length);
		}
	})


	await global.dao.mail.insertMany(mails);
	// 清空标记
	let set = { $unset: {} };
	if(REFMARKS){
		for (let mark of REFMARKS) {
			set.$unset[`others.${mark}`] = 1;
		}
	}
	if(CLEANMARKS){
		for (let mark of CLEANMARKS) {
			set.$unset[`others.${mark}`] = 1;
		}
	}
	
	
	await global.dao.role.updateMany(cond, set);
	console.error(`SCHEDULEREF JFEND ${key.toUpperCase()}`, new Date().toLocaleString());
}
