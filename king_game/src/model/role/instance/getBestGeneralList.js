
'use strict'

module.exports = exports = async function (num = 10) {
	let list = await this.db.models.general.find({rid: this._id}).hint({rid:1}).sort({class: -1, level: -1}).limit(num);
	return list.map(g => g.avatarInfo()).filter(g => !!g);
}