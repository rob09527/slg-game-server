'use strict'

// GM 执行远程函数
module.exports = exports = async function (ctx, next) {
    let {
        fn_name,
        params = []
    } = ctx.request.body;
    ctx.assert(fn_name, 'error fn_name');
    const r = await global.remote[fn_name](...params);
    ctx.body = {
        result: r
    };
}
