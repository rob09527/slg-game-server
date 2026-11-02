
'use strict'

module.exports = exports = async function (ctx, next) {
	let {
		platform, openuid, serverId, roleId,
		mailTitle, mailText, mailBtnText, mailGiftId, mailGiftCode
	} = ctx.request.body;
	ctx.role = await ctx.dao.role.findOne({uid: openuid, servid: serverId});
	ctx.assert(ctx.role, 'invalidrole');
	let reward;
	let config = global.gameconfig.cwh.PRODUCT[mailGiftId];
	if (config) {
		reward = config.ITEMS;
		ctx.assert(config && config.PRICE == 0, 'invalidmailGiftId');
		if (config.MARK) {
			ctx.assert(!ctx.role.getItems(config.MARK).count, 'alreadytake');
			ctx.role.addItemsNoSave(config.MARK);
		}
	}
	await ctx.dao.mail.create({
		type: 2, rid: ctx.role._id,
		title: mailTitle,
		content: mailText,
		reward,
	})
	await ctx.role.save();
	ctx.body = {};
}