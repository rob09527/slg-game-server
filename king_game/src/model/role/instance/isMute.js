
'use strict'
/**
 * 是否被禁言
 * @type {function(): {[p: string]: *}}
 */
module.exports = exports = async function () {
	const r = await global.redis.get('KING:MUTE:'+this._id);
	return Boolean(r);
}
