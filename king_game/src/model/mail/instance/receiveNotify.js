
'use strict'

module.exports = async function() {
	if (this.type === 1) return;
	let role = await this.db.models.role.findOne({_id: this.rid});
	if (!role) return;
	role.notifyMailReceive(this._id.toString(), this.create, this.title, this.content, this.reward);
}
