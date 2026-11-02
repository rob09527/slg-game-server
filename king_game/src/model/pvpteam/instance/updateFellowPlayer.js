
'use strict'

module.exports = exports = async function (selfId) {
	for (let {rid: _id} of this.fellows) {
		if(_id == selfId) continue;
		let role = await this.db.models.role.findOne({_id});
		if(!role) continue;
		await this.db.models.role.updateOne({_id},{$inc:{"others.95019.count":1}});
		let prop = await this.db.models.role.findOne({_id},{"others.95019.count":1,_id:0});
		if(prop && prop.others && prop.others[95019]){
			pushClient(role, {type: 'update_prop', content:[{gsid:95019,count:prop.others[95019].count}]});
		}
	}
}