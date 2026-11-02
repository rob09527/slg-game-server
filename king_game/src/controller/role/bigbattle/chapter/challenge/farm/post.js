
'use strict'

module.exports = exports = async (ctx) =>{
	let {GSID, COUNT} = ctx.config.PASS;
	let pass = ctx.role.getItems(GSID).count;
	ctx.assert(pass >= COUNT, 'challenge first');
	ctx.role.addItemsNoSave({GSID:90680, COUNT:1})//月度副本
}