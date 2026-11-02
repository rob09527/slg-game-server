
'use strict'

module.exports = exports = async function (ctx, next) {
	let timestamp = Date.now();
	let {
		old_role_name,
		new_role_name,
	} = ctx.request.body;
	ctx.assert(old_role_name !== new_role_name, 'same rname');
	// 检查角色
	let old_role = await ctx.dao.role.findOne({rname: old_role_name});
	ctx.assert(old_role, 'oldrole nexist');
	let new_role = await ctx.dao.role.findOne({rname: new_role_name});
	ctx.assert(new_role, 'newrole nexist');
	// 保存新旧uid
	let old_uid = old_role.uid;
	let new_uid = new_role.uid;
	// 设置临时uid(避免索引冲突)
	let tmpuid = 'tmpuid'+Date.now();
	console.log('UID SWITCH', 'SET NEW ROLE', 'TMP UID', tmpuid, timestamp);
	await new_role.updateOne({$set: {uid: tmpuid}});
	console.log('UID SWITCH', 'SET OLD ROLE', 'NEW UID', new_uid, timestamp);
	await old_role.updateOne({$set: {uid: new_uid}});
	console.log('UID SWITCH', 'SET NEW ROLE', 'OLD UID', old_uid, timestamp);
	await new_role.updateOne({$set: {uid: old_uid}});
	ctx.body = {timestamp}

	// 有记录就交换
	await ctx.dao.pvpking.updateOne({ servid: old_role.servid, uid: old_uid }, { $set: { uid: tmpuid } });
	await ctx.dao.pvpking.updateOne({ servid: old_role.servid, uid: new_uid }, { $set: { uid: old_uid, rid: old_role.i() } });
	await ctx.dao.pvpking.updateOne({ servid: old_role.servid, uid: tmpuid }, { $set: { uid: new_uid , rid: new_role.i() } });
	await next();
}
