
'use strict'

module.exports = exports = async function () {
	let tmp = [];
	for (const m of this._members) {
		const role = await this.db.models.role.findOne({_id: m.rid});
		if (!role) continue;
		tmp.push({
			rno: role.rno,
			name: role.rname,
			icon: role.iconid,
			headid: role.headid,
			frameid: role.frameid,
			contribute: role.getItems(38001).count,	// 暂时使用
			lastest: role.create,							// 暂时使用
		})
	}
	return tmp;
}