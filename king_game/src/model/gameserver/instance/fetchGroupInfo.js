
'use strict'

module.exports = async function(ctx, next) {
	let serverlist = await this.db.models.gameserver.find({groupid: this.groupid});
	serverlist = serverlist.map(({servid, start}) =>{
		return {
			servid,
			start,
		}
	})
	return serverlist;
}
