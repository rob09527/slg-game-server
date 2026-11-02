
'use strict'

const assert = require('assert');

module.exports = exports = async function (legionid, rid) {
	let legion = await this.findOne({_id: legionid});
	if (!legion) return;
	let ship = legion._members.deepQueryOne('rid', rid);
	// 登陆的是军团长且军团处于弹劾状态
	if (!ship || ship.pos != 2 || !legion.tanhe) return;
	// 取消弹劾
	legion.updateOne({$unset: {tanhe: 1}}).catch(console.error);
}