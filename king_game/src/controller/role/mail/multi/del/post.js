
'use strict'

module.exports = exports = async (ctx, next) =>{
	for (let mail of ctx.mails){
		ctx.assert(mail.state != 0, 'read first');
		// 置位删除状态
		mail.state = 3;
		await mail.save();
	}
}