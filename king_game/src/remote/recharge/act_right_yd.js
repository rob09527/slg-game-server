
'use strict';

module.exports = exports = async ({ctx}) =>{
	for (const row of global.gameconfig.factivity) {
		const {
			RMARK: {
				S: smark, N: nmark
			}, 
			ITEMS:{
				S: sitems
			}
		} = row;
		if (ctx.role.getItems(row.RMARK.S).count > 0) continue;	// 已领取特权奖励
		if (ctx.role.getItems(row.RMARK.N).count < 1) continue;	// 未领取普通奖励(未完成任务)
		ctx.role.addItemsNoSave(row.RMARK.S);
		const info = {
			type: 2,
			rid: ctx.role._id,
			reward: row.ITEMS.S,
			title: ctx.textgetter('YDKHACTIVITY_TITLE'),
			content: ctx.textgetter('YDKHACTIVITY_S_CONTENT', row.NAME),
		}
		await ctx.dao.mail.create(info);
	}
}