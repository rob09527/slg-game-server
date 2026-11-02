
'use strict'

async function reportOneByOne(mails) {
	for (let mail of mails) {
		await mail.receiveNotify().catch(console.error);
	}
}

module.exports = exports = {
	save: function () {
		if (this.received) this.receiveNotify().catch(console.error);
		if(this.state === 0){ // 判断是未读状态
			pushClient(this.rid, {
				type: 'mail',
				content: this.base(),
			});
		}
	},
	insertMany: function (data) {
		reportOneByOne(data).catch(console.error);
		if (data.length > 500){ // 邮件太多就不用推送了,占用 接口qps
			return;
		}
		data.forEach(item => pushClient(item.rid,	{type: 'mail', content: item.base() } ))
	}
}
