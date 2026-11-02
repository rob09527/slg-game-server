
'use strict'

async function reportOneByOne(mails) {
	for (let mail of mails) {
		await mail.receiveNotify().catch(console.error);
	}
}

module.exports = exports = {
	save: function () {
		if(this.type === 'friend'){ // 好友申请推送
			if (Math.abs(this.create - Date.now()) > 2000){ // 过期的修改不处理, 好友申请有修改 create的情况
				return;
			}
			pushClient(this.to, {
				type: 'friend_apply',
				content: this.rid,
			});
		}
	},
	insertMany: function (data) {
		if (data.length > 500){ // 太多就不用推送了,占用 接口qps
			return;
		}
		// 目前只有 好友申请需要在这里做推送，军团申请 无法在这里写推送，因为需要军团成员rid
		data.filter((item) => item.type === 'friend').forEach(item => pushClient(item.to,	{type: 'friend_apply', content: item.rid } ))
	}
}
