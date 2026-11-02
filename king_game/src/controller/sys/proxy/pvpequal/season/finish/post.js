
'use strict'

module.exports = exports = async function (ctx, next) {
	ctx.body = {};
	let {
		list,
	} = ctx.request.body;
	let mails = [];
	let reward_logs = [];
	for (let {role: {servid, uid}, rank} of list) {
		let reward;
		for (let {MAX, ITEMS} of global.gameconfig.equalreward.RANK) {
			if (rank >= MAX) continue;
			reward = ITEMS;
			break;
		}
			// 没有奖励直接跳过
		if (!reward) {
			// todo 打印提示
			continue;
		}
		let rid = await ctx.dao.role.findOne({servid, uid}, {_id: 1});
			// 找不到角色跳过
		if (!rid) {
			// todo 打印提示
			continue;
		}
		rid = rid._id;
		mails.push({
			type: 2, rid,
			title: ctx.textgetter('PVPEQUALREWARDT'),
			content: ctx.textgetter('PVPEQUALREWARDC', rank+1),
			reward,
		})
		let _reward = reward.map(({GSID, COUNT}) =>{
			return GSID + 'x' + COUNT;
		}).join('|')
		reward_logs.push(['PVPREWARDLOG', uid, servid, _reward].join(' '));
	}
	// 打印奖励日志
	console.log(reward_logs.join('\n'));
	// 保存邮件
	await ctx.dao.mail.insertMany(mails);
}