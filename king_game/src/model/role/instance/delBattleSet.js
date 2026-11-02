
'use strict'

module.exports = exports = async function (key) {
	// 移除武将数据中的阵容标记
	const old_set = this.battlearr[key];
	if (old_set) {
		let udp = {
			$unset: {
				[`battleset.${key}`]: 1,
			}	
		}
		for (let pos in old_set.team){
			let guid = old_set.team[pos];
			await this.db.models.general.updateOne({_id: guid}, udp);
		}
	}
	delete this.battlearr[key];
	this.markModified('battlearr');
	delete this._powerbattleset[key];
	this.markModified('_powerbattleset');
	await this.save();
}