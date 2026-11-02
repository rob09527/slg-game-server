'use strict'



module.exports = exports = async (ctx, next) =>{
	const relate = ctx.legion._members.deepQueryOne('rid', ctx.role.i());
	ctx.assert(relate && relate.pos >= 1, 'permission deny');

	const {SendID, RecvID, Content} = ctx.request.body
	ctx.body = {};
	// TODO  这里先这样，虽然会报错，更好的提醒后续改造(不走游密了
	const {data: {ErrorCode, ErrorInfo}} = await youmesend('query_im_send_msg', {
		MsgSeq: Date.now().toString(),
		ChatType: 2,
		SendID, RecvID, Content
	})
	if (ErrorCode) ctx.body.error = ErrorInfo;
}
