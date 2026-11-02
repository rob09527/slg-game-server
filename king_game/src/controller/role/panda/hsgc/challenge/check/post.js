
'use strict'

module.exports = exports = async (ctx) =>{
    let {mapid} = ctx.request.body;
	ctx.body = {check:ctx.CACHE.monster.includes(parseInt(mapid))};
}
