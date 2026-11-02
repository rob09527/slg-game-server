const businessCode = require("../../../util/businessCode");


module.exports = exports = async function (ctx, next) {
    let {
        page,
        package,
    } = ctx.request.body;
    let sort = {
        create: -1
    }
    if (!page || page < 1) {
        throw ('page error')
    }
    let limit = 30
    let offset = (page - 1) * limit
    let query = {}
    if (package) {
        query['packageid'] = package
    }
    let data = await ctx.dao.websaleconfig.find(query).sort(sort).limit(limit).skip(offset);
    let totalCount = await ctx.dao.websaleconfig.count();
    if (data) {
        data.forEach((element, index) => {
            //不暴露给越南方
            element.chineseitems = []
        });
    }
    ctx.body = { ...businessCode.success, data: { totalCount, package: data } }
    return

}
