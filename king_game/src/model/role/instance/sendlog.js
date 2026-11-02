
'use strict'

const debug = require('debug')('kaihei:model:role:sendlog');

module.exports = exports = function (event_name, ext_data = {}) {
	if (!event_name) return;
	if (typeof ext_data !== 'object') return;
	// let role = {
	// 	channel: this.channel || 'unknow',
	// 	platform: this.platform || 'unknow',
	// 	servid: this.servid,
	// 	uid: this.uid,
	// 	rid: this.i(),
	// 	unique_role_id: this.servid + '_' + this.uid,
	// 	name: this.name,
	// 	power: this._power,
	// 	vip: this.vip,
	// 	lv: this.level,
	// 	gnum: this.gnum,
	// }
	// let data = {create: Date.now(), event_name, role, ...ext_data};
	// debug(data);
	let data = {
		frompath: this._path_,
		create: Date.now(), 
		type: event_name, 
		servid: this.servid,
		uid: this.uid,
		rid: this.i(),
		rno: this.rno,
		name: this.name,
		vip: this.vip,
		lv: this.level,
		...ext_data
	};
	if (typeof global.sendlog === 'function') global.sendlog(data);
}