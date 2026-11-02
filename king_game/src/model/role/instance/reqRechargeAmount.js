
'use strict'


module.exports = async function () {
	let param = {
		uid: this.uid,
		servid: this.servid,
	}
	let amount = 0;
	try {
		let data = await global.remote.proxy_payment_amount_get(param);
		if (data.amount) amount = data.amount;
	}catch(err){
		console.error(err);
	}
	return amount;
}
