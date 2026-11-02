//信息获取
module.exports = async (ctx) => {
    let result = await global.dao.ssdbRole.findOne({ rid: ctx.role.rid })

    ctx.body = result
};