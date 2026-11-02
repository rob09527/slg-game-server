
'use strict'

module.exports = exports = {
	/**
	 *  替换游戏配置的一个配置表 结构
	 *   {
	 *      zhd: {
	 *          LGJJ: {} // 替换 zhd 下的 LGJJ字段
	 *      },
	 *
	 *   }
	 */
	config: {
		type: Object,
		default: {}
	},
	update: {
		type: Number
	}
}
