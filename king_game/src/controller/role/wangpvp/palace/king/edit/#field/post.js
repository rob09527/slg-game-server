
'use strict'

const _ = require('lodash');

const ONLY_FIELS = [
	'name',
	'icon',
]

const {
	EDIT_CAST,
} = global.gameconfig.kingdom;

module.exports = exports = async function (ctx, next) {
	let field_name = ctx.params.field;
	ctx.assert(ONLY_FIELS.includes(field_name), 'invalid field');
	let count = ctx.kingdom.editcount[field_name] || 0;
	let cast = EDIT_CAST[count] || _.last(EDIT_CAST);
	// 图腾不消耗
	if (field_name === 'icon') cast = [];
	if (cast.length > 0) {
		ctx.role.castItemsNoSave(cast);
		await ctx.role.save();
	}
	let udp = {
		$set: {
			[field_name]: ctx.request.body[field_name]
		},
		$inc: {
			[`editcount.${field_name}`]: 1,
		}
	}
	await ctx.kingdom.updateOne(udp);
	//TODO 更新缓存
	cast = EDIT_CAST[ctx.kingdom.editcount[field_name] + 1];
	if (!cast) cast = _.last(EDIT_CAST);
	await ctx.dao.nationwar_serverinfo.updateOne({ servers: ctx.role.servid }, {
		$set: {
			[field_name]: ctx.request.body[field_name]
		}
	})
	ctx.body = {
		[field_name]: cast,
	};
}