
'use strict'

module.exports = {
	// 军团ID
	legion: {type: String, require: 1},
	// 总伤害量,玩家挑战的总伤害量,用来计算boss当前阶段
	totaldamage: {type: Number, default: 0},
	/*
		每个阶段的完成时间及最后制造伤害的人,例
		[
			{
				rid: '5f3e2b644b1a681760c02a3d',
				time: 1598284116389,
			}
		]
	 */
	stagefinish: [],
	/*
		挑战记录结构如下
		[
			{
				// 军团成员rid
				rid: '5f3e2b644b1a681760c02a3d',
				// 角色上次伤害
				lastdamage: 10302,
				// 角色总伤害
				totaldamage: 1328491,
				// 角色挑战次数
				num: 2,
			},
			...
		]
	 */
	roles: [],
	// 更新时间,每次挑战/扫荡后需更新
	update: {type: Number, default: Date.now},
	// 创建时间
	create: {type: Number, default: Date.now},
}
