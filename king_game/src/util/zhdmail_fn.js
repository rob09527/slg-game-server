
'use strict'

const tg = require('./textgetter');
const utilCursor = require('./cursor');

module.exports = exports = async function (prefix, items = []){
	console.error('SCHEDULEREF zhdmail'+prefix, new Date().toLocaleString());
	let mail_prefix = `ZHD${prefix.toUpperCase()}`;


	const mails = [];
	await utilCursor(global.dao.role.find({}, {_id: 1}), async (role)=> {
		mails.push({
			type: 2, rid: role._id,
			title: tg(mail_prefix + 'T') || '??',
			content: tg(mail_prefix + 'C') || '??',
			reward: items,
		});
		if (mails.length > 1000) {
			await global.dao.mail.insertMany(mails).catch(console.error);
			mails.splice(0, mails.length);
		}
	});
 	if(mails.length) {
		await global.dao.mail.insertMany(mails);
	}
}
