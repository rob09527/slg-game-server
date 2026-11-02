
'use strict'

const assert = require('assert');

const textgetter = require('./../../../util/textgetter');

const MAX_ROLES = 5;

const _ = require('lodash');

module.exports = exports = async function (type, goal, rid, groupid) {
	let config = global.gameconfig.rankmission[type];
	assert(config, 'invalid ranktype');
	for (let i = 0; i < config.length; i++) {
		let mission_config = config[i];
		let {
			GOAL,
			WORD,
			REWARDLIST,
		} = mission_config;
		if (goal < mission_config.GOAL) break;
		let record = await this.findMissionRecord(type, i, groupid);
		// 检查是否在X名前完成成就
		if (record.roles.length >= MAX_ROLES) continue;
		// 是否已经在前X名完成角色内
		let ridset = new Set(_.map(record.roles, 'rid'));
		if (ridset.has(rid)) continue;
		record.roles.push({
			rid,
			time: Date.now(),
		});
		// 保存成就后发送奖励邮件
		record.save()
			.then(() =>{
				return this.db.models.mail.create({
					type: 2,
					rid,
					title: textgetter(`RANKMISSION_TITLE_${type.toUpperCase()}`),
					content: textgetter(`RANKMISSION_CONTENT_${type.toUpperCase()}`, WORD, record.roles.length),
					reward: REWARDLIST[record.roles.length - 1],
				})
			})
			.catch(console.error)
	}
}
