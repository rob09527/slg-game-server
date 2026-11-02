const imprisonment = require("../../../../../../model/prisoner/instance/imprisonment");
const updateRoleseat = require("../../../../../../model/role/instance/updateRoleseat");
//关押
module.exports = exports = async function (ctx, next) {

    let {
        id, seat
    } = ctx.request.body;
    let result = await imprisonment(ctx, id, seat)
    ctx.assert(result, 'Insufficient position');

    ctx.role.addItemsNoSave({ gsid: 94899, count: 1 })
    await ctx.role.save()
    ctx.body = result
}
