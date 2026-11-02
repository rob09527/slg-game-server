
'use strict'

module.exports = exports = async function () {
	let tmp = this.toJSON();

	tmp.members = [];
	let total_power = 0;
	const roles = await this.db.models.role.find({_id: tmp._members.map(o => o.rid)}, {others: 0, props: 0, battlearr: 0});
	const roleMap = {};
	roles.forEach(o => {
		roleMap[o.i()] = o;
	})
	for (const m of tmp._members) {
		const role = roleMap[m.rid];
		if (!role) continue;
		total_power += role._power;
		if (m.pos == 2) tmp.ceo = role.name;
		tmp.members.push({
			id: role.i(),
			name: role.name,
			icon: role.iconid,
			headid: role.headid,
			frameid: role.frameid,
			vip: role.vip,
			set: role.set,
			lv: role.level,
			lastest: role.update,
			isonline: role.isonline,
			power: role._power,
			pos: m.pos,
			score: role.getItems(90299).count,
		})
	}
	tmp.power = total_power;
	this.power = tmp.power;
	await this.save()
	tmp.nextmail = tmp.lastmail + global.gameconfig.others.LEGION.MAIL_INTERVAL;
	delete tmp._expdaily
	delete tmp._exp;
	delete tmp._fexp;
	delete tmp.boss;
	delete tmp._id;
	delete tmp.__v;
	delete tmp._members;
	delete tmp.tanhe;
	return tmp;
}
