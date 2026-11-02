
'use strict'

const assert = require('assert');

module.exports = exports =  function(owner) {
	const data = this.toJSON({});
	delete data.__v;
	data.care = data.history.find((r)=> r.rid === owner) ? 1 : 0;
	if(!data.care){
		data.care = data.noticer && data.noticer[owner] ? 1 : 0;
	}

	const his = [...this.history];
	data.to_receive = 0;

	data.sellprice = data.auctionPrice;
	if(his.length > 0){
		const last = his.pop();
		data.sellprice = last.price;
		if(last.rid === owner) {
			data.top = 1; // 表名自己是领先的
		}
		for (let h of his) {
			if(h.state){
				continue;
			}
			if(h.rid === owner){ // 有返费未领取
				data.to_receive += h.price;
			}
		}
	}

	delete data.bounceList; // 不返回分红列表
	delete data.noticer;
	return data;
}
