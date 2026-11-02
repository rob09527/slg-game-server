
'use strict'

const chkcontent	= require("../../../../util/chkcontent")
const h5post		= require("../../../../util/h5post")

const RNAME_CHANGE_CAST = [
	{GSID: 38005, COUNT: 500}
]
const heads = global.gameconfig.heads;
module.exports = exports = async (ctx, next) =>{
	ctx.body = {};
	if( ctx.params.key.startsWith('others') || ctx.params.key.startsWith('hide') || ctx.params.key.startsWith('props')){
		// 不解释 这些字段不能通过这种方式修改
		return;
	}

	ctx.body = {castitems: []}
	let old_name;
	if (ctx.params.key === 'rname') {
		const name = ctx.request.body.rname;
		const regEn = /[`~!@#$%^&*()_+<>?: "{},.\/;'[\]]/im;
		const regCn = /[·！#￥（——）：；“”‘、，|《。》？、【】[\]]/im;
		ctx.assert(!regEn.test(name) && !regCn.test(name), 'invalid symbol');
		console.log('---ctx.role._gameserv.group_sid_list', ctx.role._gameserv.group_sid_list);
		const exists = await ctx.dao.role.countDocuments({
			rname: name,
			servid: {
				$in: ctx.role._gameserv.group_sid_list
			}
		});
		const chk = await chkcontent(ctx.role, 1, name);
		ctx.assert(chk, "invalid string");
		ctx.assert(!exists, 'rname exists');
		if (ctx.role.getProp(90157) > 0) {
			// 只要这个标记大于0则扣除，记录玩家是否改名
			ctx.role.castItemsNoSave({ gsid: 90157, count: 1 });
			ctx.body.castitems.push({ gsid: 90157, count: 1 });
		}
		else {
			if (ctx.role.level >= 30) {
				ctx.body.castitems.push(...RNAME_CHANGE_CAST);
				ctx.role.castItemsNoSave(RNAME_CHANGE_CAST);
			}
		}
		old_name = ctx.role.name;
	}else if (ctx.params.key === 'headid') {
		// 修改头像需要把原来的iconid也修改
		let gsid = heads[ctx.request.body[ctx.params.key]];
		if (gsid) {
			ctx.role['iconid']= gsid.GSID;
		}
	} else if (ctx.params.key.indexOf('.') > 0){

		await ctx.dao.role.updateOne({_id: ctx.role._id}, {[ctx.params.key]:  ctx.request.body[ctx.params.key]})
		ctx.body = {};
		return;
	}
	ctx.role[ctx.params.key] = ctx.request.body[ctx.params.key];
	ctx.role.markModified(ctx.params.key);
	await ctx.role.save();
	// 异步发送消息到msgtranfer
	// if (ctx.params.key === 'rname' && old_name) {
	// 	let data = {
	// 		rid: ctx.role.i(),
	// 		ip: ctx.ip,
	// 		uid: ctx.role.uid,
	// 		servid: ctx.role.servid,
	// 		old_name,
	// 		new_name: ctx.role.name,
	// 	}
	// 	ctx.msgsend({path: '/player/modify/name', opts: {data}}).catch(console.error);
	// }
}
