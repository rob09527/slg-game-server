
'use strict'

const {curl} = require('urllib');

module.exports = exports = async function (ctx, next) {
	let {condition = {name: 'default'}, pause} = ctx.request.body;
	console.error(condition);
	const {ok} = await ctx.dao.cdkey.update(condition, {$set:{pause: pause? true: false}});
	ctx.body = {ok};
}