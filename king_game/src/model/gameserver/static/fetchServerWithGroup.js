/**
 * 获取服务器组相关信息,返回如下
 * {
 * 	// 以下字段说明见gameserver.schema
 * 	servid: 1001,
 * 	name: 1fu,
 * 	groupid: 0,
 * 	start: 1625124319000,
 * 	create: 1625124319000,
 * 	// 额外字段
 * 	groupstart: 1625124319000, // 多服组开服时间,以组内首个开服的服务器开服时间为准
 * 	group_sid_list: [	// 服务器组id列表
 * 		1001,
 * 		1002,
 * 		...
 * 	]
 * }
 */
'use strict'

module.exports = async function (servid) {
	let serv = await this.findOne({servid}, {info: 0, sno: 0});
	if (!serv) return;
	let servergroup = await serv.fetchGroupInfo();
	let data = serv.toJSON();
	data.groupstart = servergroup[0].start;;
	data.group_sid_list = servergroup.map(({servid}) => servid);
	return data;
}
