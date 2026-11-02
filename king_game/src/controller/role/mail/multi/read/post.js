
'use strict'

module.exports = exports = async (ctx, next) =>{
	for (let mail of ctx.mails){
		if (mail.type == 1 && mail.state != 1) {
			mail.state = 1;
			await mail.save();
		}
	}
}