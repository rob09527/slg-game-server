
'use strict'

const textgetter = require('./../util/textgetter');
const utilCursor = require('./../util/cursor');

module.exports = exports = async function (cycle) {
	const config = global.gameconfig['pvpmultireward'+cycle];
	if (!config) throw new Error('invalid cycle');
	// 查找所有参与的玩家
	let cond = {
		pvpmultiscore: {$exists: 1},
	}

	let mails = [];
	await utilCursor(global.dao.role.find(cond,{rname: 1, pvpmultiscore: 1}).sort({pvpmultiscore: -1}), async (role, i)=> {
		for (let {MAX, ITEMS} of config) {
			if (i >= MAX) continue;
			mails.push({
				rid: role._id, type: 2, reward: ITEMS,
				title: textgetter('PVPMULTIREWARD_TITLE_'+cycle.toUpperCase()),
				content: textgetter('PVPMULTIREWARD_CONTENT_'+cycle.toUpperCase(), i + 1),
			})
			break;
		}
		if (mails.length > 1000) {
			await global.dao.mail.insertMany(mails).catch(console.error);
			mails.splice(0, mails.length);
		}
	})
	if(mails.length) {
		await global.dao.mail.insertMany(mails);
	}
	console.log('pvpmulti reward', cycle, mails.length, Date.now());
}
