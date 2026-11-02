
'use strict'

const RIGHT = [0, 1, 2];

module.exports = exports = async (ctx, next) =>{
	let {rid, type} = ctx.request.body;
	type = parseInt(type);
	ctx.assert(RIGHT.includes(type), 'invalid type');
	ctx.assert(rid !== ctx.role.i(), 'handover first');
	const myship = ctx.legion._members.deepQueryOne('rid', ctx.role.i());
	const ship = ctx.legion._members.deepQueryOne('rid', rid);
	ctx.assert(ship, 'role nexist');
	if (type == 2) {	// 军团长转移
		myship.pos = 0;
	}else if (type == 1) {
		const officers = ctx.legion._members.deepQuery('pos', 1);
		ctx.assert(officers.length < 3, 'no more');	// 检查官员人数
		ctx.assert(ship.pos != type, 'already set');	// 不能设定已有官员
	}
	ship.pos = type
	ctx.legion.markModified('_members');
	await ctx.legion.save();
	ctx.body = {};
	if (type < 1) return;
	try {
		let member = await ctx.dao.role.findOne({_id: rid}, {rno: 1, rname: 1});
		let params = [ctx.role.name, member.name];
		let event = type == 2? 'transfer': 'appoint';
		ctx.dao.c_legionlog.create({legion: ctx.legion._id, event, params}).catch(console.error);
	}catch(err){
		console.error(err);
	}
}