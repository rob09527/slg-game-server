'use strict'

module.exports = exports = async (ctx, next) =>{
	let {arr = []} = ctx.request.body;

    ctx.body = {};
    arr.forEach(element => {
        ctx.body[element] = ctx.role.getProp(element);
    });
}