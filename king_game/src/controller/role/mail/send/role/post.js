
'use strict'

module.exports = exports = async (ctx, next) =>{
	ctx.assert(ctx.role.getProp(38004) >= 3, 'rank limit');
	const {rid, title, content} = ctx.request.body;
	ctx.body = {};
	ctx.hook.pre(EVENT_ENUM.PRIVATEMAIL);
	// 被禁言用户检查
	const mute = await ctx.role.isMute();
	if (mute) return;
	ctx.assert(rid !== ctx.role.i(), 'cant send');
	const role = ctx.dao.role.findOne({_id: rid});
	ctx.assert(role, 'invalid rid');
	// 自己是否在对方的黑名单内
	let record = await ctx.dao.blacklist.findOne({rid, target: ctx.role._id});
	if (record) return;
	// 对方是否在自己的黑名单内
	record = await ctx.dao.blacklist.findOne({rid: ctx.role._id, target: rid});
	ctx.assert(!record, 'in blacklist');
	let from = {
		type: 'role',
		fid: ctx.role.i(),
	}
	if (ctx.role.legion) from.legion = ctx.role.legion;
	let target = await ctx.dao.role.findOne({_id: rid}, {rname: 1, rno: 1});
	ctx.assert(target, 'player nexist');
	await ctx.dao.mail.create({
		rid,
		title,
		content,
		from,
	})
	// 上报反公会后台
	// let data = {
	// 	rid: ctx.role.i(),
	// 	uid: ctx.role.uid,
	// 	name: ctx.role.name,
	// 	servid: ctx.role.servid,
	// 	ip: ctx.ip,
	// 	message: content,
	// 	toplayer: {
	// 		rid,
	// 		name: target.name,
	// 	},
	// };
	// ctx.msgsend({path: '/mail/toplayer', opts: {data}}).catch(console.error);
}
