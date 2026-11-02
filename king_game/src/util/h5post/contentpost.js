
'use strict'
// 敏感词检查

module.exports = exports = async function(role, data, other) {
	if(other.wordcheck != 1) return true;
	const time = Math.floor(Date.now()/1000);
	data.game_id = other.game_id;
	data.time = time
	return role.h5postfn("/api/game/check/word", data);
}