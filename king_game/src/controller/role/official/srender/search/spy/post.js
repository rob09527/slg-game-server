
const checkPrisoner = require("../../../../../../model/prisoner/instance/checkPrisoner");
const expireUserinfo = require("../../../../../../util/expireUserinfo");

module.exports = exports = async function (ctx, next) {
    let {
        rid
    } = ctx.request.body;
    const key = `${ctx.role._id.toString()}-prisoner`
    var cacheInfo = await expireUserinfo(key, true)
    cacheInfo.spy += 1
    let config = global.gameconfig.surrendersearch[3].find(e => e.SPYNUM == cacheInfo.spy)
    ctx.assert(config, 'count not enough');


    const searchResult = await global.dao.prisoner.find({ rid })

    // 获取战俘详细信息 
    var prisonerDocNew = []
    const role = await global.dao.role.findOne({ _id: rid });
    searchResult.map(async e => {
        let name = role.name
        let power = role._power
        let doc_ = e._doc
        let config = global.gameconfig.surrender.deepQueryOne('GSID', e.gsid);
        doc_.cost = config.CAST
        doc_.kill = config.KILL
        doc_.rating = config.RATING
        doc_.name = name
        doc_.power = power
        doc_.seat = role.seat
        if (checkPrisoner(doc_)) {
            prisonerDocNew.push(doc_)
        }

    })
    ctx.role.castItemsNoSave(config.item);
    await ctx.role.save();
    await expireUserinfo(key, false, cacheInfo)

    if (prisonerDocNew.length == 0) {
        let data = {
            name: role.name,
            power: role._power,
            gsid: 0,
            headid: role.headid,
            iconid: role.iconid,

        }
        ctx.body = [data]
        return;
    }

    ctx.body = prisonerDocNew
};


