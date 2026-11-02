
'use strict'

module.exports = exports = async (ctx, next) =>{
	let rids = [];
	if (ctx.params.type === 'all') {
		rids = await ctx.dao.role.find({servid: parseInt(ctx.request.body.sid) || 1}, {_id: 1});
		rids = rids.map(function (rid) {
			return rid._id.toString();
		})
	}else{
		for (const str of ctx.request.body.players){	// convert to rid
			if (str.startsWith('name#')) {
				const player = await ctx.dao.role.findOne({rname: str.slice(5)});
				ctx.assert(player, 'invalid player' + str);
				rids.push(player.i());
			}else if (str.startsWith('uid#')) {
				let player = await ctx.dao.role.findOne({uid: str.slice(4)}, {_id: 1});
				if (!player) continue;
				rids.push(player.i());
			}else{
				rids.push(str);
			}
		}
	}
	let {title, content, items = []} = ctx.request.body;
	items = items.map(item =>{
		if (typeof item.COUNT === 'string') {
			item.COUNT = parseInt(item.COUNT);
		}
		return item;
	})
	const mail_type = items.length > 0 ? 2: 1;
	for (const rid of rids){
		await ctx.dao.mail.create({
			rid: rid, type: mail_type,
			title: title, content: content, reward: items
		})
	}
	ctx.body = {num: rids.length};
}