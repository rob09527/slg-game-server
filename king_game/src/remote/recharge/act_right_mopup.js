
'use strict';

module.exports = exports = async ({ctx, is_xufei}) =>{
	let add = [{GSID:90670, COUNT:3},{GSID:90671, COUNT:0}];
	let count_693 = ctx.role.getProp(90693);
	if (count_693 < 3) {
		add.push({GSID:90693, COUNT:3 - count_693})
	}
	else {
		ctx.role.castItemsNoSave({GSID:90693, COUNT:count_693 - 3});
	}
	ctx.role.addItemsNoSave(add);
}
