
'use strict'

module.exports = exports = function () {
	let {type, id: eid} = this.event;
	let tmp = {
		hash: this._id.toString(),
		id: this.stationid,
		type, eid,
	}
	if (type === 1) {	// 武将偶遇
		if (this.battlewin) tmp.catchchance = this.catchchance;
	}
	if (type == 3) {	// 商人事件配置
		let {ITEMS, MIN} = global.gameconfig.meventt3.deepQueryOne('ID', eid);
		tmp.items = ITEMS.map(function ({ADD: get, CAST: pay}) {
			return {pay, get};
		})
		tmp.etime = this.create + MIN * 60 * 1000;
	}
	if (type == 4) {	// 运气挑战
		tmp.winnum = this.roll.time;
		let {MIN} = global.gameconfig.meventt4.deepQueryOne('ID', eid);
		tmp.etime = this.create + MIN * 60 * 1000;
	}
	if (type == 5) {	// 宝藏
		tmp.preview = this.items;
	}
	if (type == 7) {	// 巡逻事件
		let {MIN,ITEMS,TIME,VADDRESS=[],VEDIO_TYPE} = global.gameconfig.meventt7.deepQueryOne('ID', eid);
		tmp.timeconfig = TIME;
		tmp.items7 = ITEMS;
		tmp.etime = this.create + MIN * 60 * 1000;
		tmp.vaddress = VADDRESS;
		tmp.vedio_type =VEDIO_TYPE;
	}
	return tmp;
}