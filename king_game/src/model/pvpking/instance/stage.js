
'use strict'

const {
	PVPKING: {
		TOPNUM = 10
	},
} = global.gameconfig.others;

module.exports = exports = async function () {
	if (!this.kingpvp) return 0;
	let {l0, l1} = this.kingpvp;
	let config = global.gameconfig.pvpkingrank[l0][l1];
	if (l0 < 5) return config.ID;
	// 玩家已经在大师段位,检查是否王者
	// 查找大师段位前10玩家
	let top_num = TOPNUM;
	let serverInfo = await global.dao.kinggroup.findOne({servid: this.servid});
	let serverlist = await global.dao.kinggroup.find({groupmark: serverInfo.groupmark});
	if (!serverlist) return 101;
	if (serverlist.length > 1) top_num = 30;
	serverlist = serverlist.map(({servid}) => servid);
	let cond = {
		servid: {
			$in: serverlist,
		},
		'kingpvp.l0': 5,
	};
	let rids = await global.dao.pvpking.find(cond, '_id').sort({'kingpvp.star': -1}).limit(top_num);
	rids = rids.map(({_id}) =>{
		return _id.toString();
	})
	if (rids.includes(this._id.toString())) config = global.gameconfig.pvpkingrank[6][0];
	return config.ID;
}