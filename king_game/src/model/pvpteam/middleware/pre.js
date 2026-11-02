
'use strict';

module.exports = exports = {
	save: async function (next) {
		if (!this.teamno) {
			let teamno = await this.db.models.pvpteam.find({}, {_id: 0, teamno: 1}).sort({teamno: -1}).limit(1);
			teamno = teamno[0] || {teamno: 340011};
			teamno = teamno.teamno + 1;
			this.teamno = teamno;
		}
		let stamina = this.getSta();
	}
}