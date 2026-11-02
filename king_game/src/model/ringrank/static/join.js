
'use strict'
const assert = require("assert");
// 报名加入 国战擂台
/**
 *
 * @param role {{}} // 角色基础信息
 */
module.exports = exports = async function (role) {

	const rid = role.rid || role.id || (role._id + '');
	let u = await this.findOne({rid});
	const roleObj = {
		imageid: role.imageid,
		frameid: role.frameid,
		headid: role.headid,
		level: role.level,
		power: role.power,
		name: role.name,
		servid: role.servid,
		honor_value: role.honor_value
	};

	if (u){
		// 单纯更新 用户信息
		await this.updateOne({rid}, {
			$set: {
				role: roleObj
			}
		})
	} else {

		const groupmark = await global.dao.nationwar_serverinfo.findMarkByServid(+role.servid);
		// 检测国战是否完美结束
		assert(groupmark, "cant nation");
		u = await this.create({
			rid,
			groupmark,
			role: roleObj,
			rank: await global.dao.counter.getCount('ringrank' + groupmark), // 新加入的排名在最后
			last_honor_time: Date.now()
		});
	}
	return u;
}
