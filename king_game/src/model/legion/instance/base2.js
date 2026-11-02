
'use strict'

module.exports = exports = async function (rid) {
	let tmp = {
		id: this._id.toString(),
		flag: this.flag,
		lv: this.level,
		name: this.name,
		npnum: this._members.length,
		notice: this.notice,
		mpnum: this.mpnum,
		minlv: this.minlv,
		power: this.power,
		ispass: this.ispass,
		ceo: await this.fetchCEOName(),
	}

	let apply = await this.db.models.apply.findOne({type: 'legion', rid, to: this._id});
	if (apply) tmp.lastapply = apply.create;

	return tmp;
}
