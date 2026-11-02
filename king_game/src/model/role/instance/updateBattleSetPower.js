
'use strict'

module.exports = exports = async function (key) {
	let team = this.battlearr[key];
	if (!team) return;
	team = team.team;
	let power = 0;
	const generalMap = await this.findGenerals(Object.values(team));

	for (let pos in team){
		const guid = team[pos];
		const general = generalMap[guid];
		if (!general) continue;
		power += general.base().power;
	}
	this._powerbattleset[key] = power;
	this.markModified('_powerbattleset');
}
