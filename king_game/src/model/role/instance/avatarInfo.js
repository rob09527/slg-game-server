
'use strict'

module.exports = exports = function () {
	
	let info = {
		iconid: this.iconid,
		frameid: this.frameid,
		imageid: this.imageid,
		headid:this.headid,
		level: this.level,
		sex: this.sex,
		vip: this.vip,
		rid:this._id,
		set: this.set,
		servid:this.servid,
		titleid:this.titleid
	}
	return {...this.labelInfo(), ...info}
}
