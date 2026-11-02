
'use strict'

module.exports = exports = {
	save: function () {
		if(!this.take){ // 判断是领取状态
			pushClient(this.to, {
				type: 'friend_fpoint',
				content: this.rid,
			});
		}
	},
	insertMany: function (data) {
 		data.forEach(item => pushClient(item.to,	{type: 'friend_fpoint', content: item.rid } ))
	}
}
