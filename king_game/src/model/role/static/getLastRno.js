
'use strict'

module.exports = async function () {
	let rno = await this.find({}, {rno: 1}).sort({rno: -1}).limit(1);
	if (rno.length < 1) return this.schema.obj.rno.min;
	rno = rno[0].rno;
	return rno;
}