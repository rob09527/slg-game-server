

//天牢战报
module.exports = exports = async function (ctx, next) {
    console.log(ctx.role._id.toString())
    let info = []
    info = await global.dao.prisonerRecord.find({ rid: ctx.role._id, state: 1 }).sort({ create: -1 }).limit(10)
    let clientinfo = []
    info.map(e => {
        clientinfo.push(e._doc)
    })

    ctx.body = clientinfo
}
