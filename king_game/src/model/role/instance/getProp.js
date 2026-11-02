
'use strict'

/**
 * 获取 role 属性
 * @param name {string | number}
 */
module.exports = exports = function (name) {
	if(!name) return ;
	if (!isNaN(name)){ // number 类型为 gsid
		return this.getItems(name).count;
	}
	let o = this;
	for (const key of name.split('.')){
		o = o[key];
		if (!o) return o;
	}
	return o;
}
