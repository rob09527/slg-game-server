
'use strict'

module.exports = exports = async function (ctx, next) {
	assert.fail('请升级客户端');
	// const lv = ctx.role.getItems(38004).count;
	// const marks = global.gameconfig.official[lv];
	// const config = global.gameconfig.officialitems[lv];
	// ctx.assert(marks && config, 'lv limit');
	// const confirm = marks.every(function (m) {
	// 	return ctx.role.getItems(m).count > 0;
	// })
	// ctx.assert(confirm, 'not finish');
	// ctx.role.addItemsNoSave(config.REWARD);
	// ctx.role.hide['38004'] = {count: lv+1};
	// ctx.role.markModified('hide.38004');
	// await ctx.role.save();
	// ctx.body = config.REWARD;
}
