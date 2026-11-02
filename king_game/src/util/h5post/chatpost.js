
'use strict'
// 上报聊天信息

module.exports = exports = async function(role, data, other) {
	let type = 0;
	if(data.room.startsWith("serv"))
		type = 3;
	else if(data.room.startsWith("cross"))
		type = 4;
	else if(data.room.startsWith("legion"))
		type = 5;
	const time = Math.floor(Date.now()/1000);
	const ip = other.ip.split(':').pop();
	let uid = role.uid.substring(7, role.uid.length);
	let params = {
		type,
		game_id : other.game_id,
		server_id : role._gameserv.servid,
		user_id : uid,
		role_id : role.rno,
		role_level : role.level,
		msg : data.message,
		time,
		ip
	}
	return role.h5postfn("/api/chat/receive", params);
}