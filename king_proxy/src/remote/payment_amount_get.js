/**
 * 获取角色充值总额
 */

'use strict'

module.exports = async params =>{
	let {
		servid,
		uid,
	} = params;
	let cond = {
		uid,
		servid,
		confirm: {$exists: 1},
	}
	let orders = await global.dao.order.find(cond, {price: 1});
	let amount = orders.reduce((cur, {price = 0}) => cur += price, 0);
	return {amount};
}
