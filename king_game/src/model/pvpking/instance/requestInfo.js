
'use strict'

const {curl} = require('urllib');

module.exports = exports = async _ =>{
	let {
		servid,
		uid,
	} = this;
	let serv = global.servers.serv.deepQueryOne('info.id', servid);
	if (!serv) return;
	let {
		info: {
			host,
			port,
		}
	} = serv;
	let opts = {
		method: 'POST',
		contentType: 'json',
		dataType: 'json',
		headers: {'x-kaihei': 1},
		data: {uid, servid},
	}
	let url = `http://${host}:${port}/common/role/cnode/kingpvp`
	let {status, data} = await curl(url, opts);
	if (status != 200) return {error: 'request fail'};
	return data;
}