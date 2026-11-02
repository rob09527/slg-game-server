
'use strict'

const assert = require('assert');

/**
* 军团列表绑定战斗力
* @param legions []
 * @param applyId {string} 申请则ID
*
*
*/
module.exports = exports = async function (legions, applyId = undefined) {
	const mb = [];

	legions.forEach(it => it._members.forEach(m => mb.push(m.rid) ));
	const roles = await this.db.models.role.find({_id:{$in: mb}}, {_power: 1, _id: 1, rname: 1});
	const roleObj = {};
	roles.forEach(r => roleObj[r.i()] = r  );

	const applys = await this.db.models.apply.find({type: 'legion', applyId, to: {$in: legions.map(o => o._id.toString() )}});
	const applyObj = {};
	applys.forEach(a => applyObj[a.to] = a.create);

	const items = legions.map(lg => {
		const id = lg._id.toString();
		const item = {
			id: id,
			flag: lg.flag,
			lv: lg.level,
			name: lg.name,
			npnum: lg._members.length,
			notice: lg.notice,
			mpnum: lg.mpnum,
			minlv: lg.minlv,
			ispass: lg.ispass,
			power: 0,
			lastapply: applyObj[id]
		}
		lg._members.forEach(m => roleObj[m.rid]?( (item.power += roleObj[m.rid]._power) | (m.pos === 2 && (item.ceo = roleObj[m.rid].rname)) ):'' )
		return item;
	});

	return items;
}
