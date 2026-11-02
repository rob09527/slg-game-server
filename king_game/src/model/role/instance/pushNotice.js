
'use strict'


// 周活动 - 秘境宝阁 推送
const mjbgSend = function(){
	let MJBG = global.gameconfig.zhd_mjbg;
	if (!MJBG){ //
		return;
	}
	const bgIndex = this.mjbg ? (this.mjbg.index || 0) : 0;
	const mjConfig = MJBG.CONSUME[bgIndex];
	if (!mjConfig){
		return;
	}
	if (!this.item_tmp.find((a) => +a.GSID === +mjConfig.GSID)){
		return ;
	}
	const TYPE = 'MJBG';
	if(global.config.ZHD[TYPE]){
		if(!Date.in(...global.config.ZHD[TYPE]) ){
			return;
		}
	}
	if (this.getProp(mjConfig.GSID) >= mjConfig.COUNT ) {
		pushClient(this, {type: "zhd", content: {mjbg: 1}});
	}
};

/**
 *
 * 推送红点通知
 *
 * @author awko
 */
module.exports = function () {
	this.jfhdRewardSend(this.item_tmp); // 积分类活动红点通知
	mjbgSend.call(this);
}
