

'use strict'
/**
 * 获取服务器组相关信息,返回如下
 * {
 * 	// 以下字段说明见gameserver.schema
 * 	_id: 1, 合服分组ID
 * 	start: 开服时间,
 * 	servid: 合服组最小id,
 * 	servers: 合服组下所以servid
 * }
 */
module.exports = async function () {
	let serv = await this.find();
	if (!serv) return;
    return serv;
}


