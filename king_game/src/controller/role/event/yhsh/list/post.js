
'use strict'

module.exports = exports = async function (ctx, next) {
	const {
		YHSH: {
			TASK,
		}
	} = global.gameconfig.zhd_newhero;
	ctx.body = TASK.map(({ITEMS: items, INTRO: intro, RMARK, FINISH}) => {
		let status = 0;
		let {
			GSID: process_gsid,
			COUNT: maxnum,
		} = FINISH[0];
		let nownum = ctx.role.getProp(process_gsid);
		// 检查是否完成
		let is_finish = FINISH.every(({GSID, COUNT}) =>{
			return ctx.role.getProp(GSID) >= COUNT;
		})
		if (is_finish) status = 1;
		// 检查是否已领取
		let is_take = RMARK.every(({GSID, COUNT}) => {
			return ctx.role.getProp(GSID) >= COUNT;
		})
		if (is_take) status = 2;
		return {
			nownum,
			maxnum,
			items,
			intro,
			status,
		};
	})
}