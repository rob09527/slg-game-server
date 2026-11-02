
'use strict'
// 上下线

module.exports = exports = async function(role, data, other) {
	let uid = role.uid.substring(7, role.uid.length);
	const time = Math.floor(Date.now()/1000);
	let params = {
		type: data.type,
		game_id : other.game_id,
		server_id : role._gameserv.servid,
		user_id : uid,
		role_id : role.rno,
		role_name: role.name,
		role_level : role.level,
		login_time : data.login_time,
		time
	}
	return role.h5postfn("/api/user/roles/online", params);
}