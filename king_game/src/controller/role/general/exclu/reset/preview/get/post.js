
'use strict'

module.exports = exports = async (ctx, next) =>{
	ctx.assert(ctx.preview, 'preview nexist');
}