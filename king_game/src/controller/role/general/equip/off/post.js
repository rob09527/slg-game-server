
'use strict'

module.exports = exports = async (ctx, next) =>{
	let pos = ctx.request.body.pos - 1;

	let equip = ctx.general.equip[pos];

	ctx.assert(equip, 'no equip');
	ctx.role.addItemsNoSave({gsid: equip, count: 1, unmark: 1});
	
	ctx.general.equip[pos] = null;
	ctx.general.markModified('equip');
}