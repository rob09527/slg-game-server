
//配置表信息
module.exports = exports = async function (ctx, next) {
    let list = [global.gameconfig.surrenderseat, global.gameconfig.surrendersearch, global.gameconfig.surrenderfight]
    ctx.body = list
};