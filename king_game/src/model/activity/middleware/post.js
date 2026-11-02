
'use strict'



module.exports = exports = {
	save: function () {
		// 通知其他 worker 更新活动
		global.msgcenter && msgcenter.send({"type": "activity-refresh",data: 1});
	},

}
