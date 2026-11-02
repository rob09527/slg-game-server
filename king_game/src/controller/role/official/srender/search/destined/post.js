const checkPrisoner = require("../../../../../../model/prisoner/instance/checkPrisoner");
const prisonerItem = require("../../../../../../model/prisoner/instance/prisonerItem");
const acquireLock = require("../../../../../../util/acquireLock");
const expireUserinfo = require("../../../../../../util/expireUserinfo");
//前往
module.exports = exports = async function (ctx, next) {
    let {
        rid,
    } = ctx.request.body;
    const key = `${ctx.role._id.toString()}-prisoner`
    var cacheInfo = await expireUserinfo(key, true)
    if (!cacheInfo || rid == ctx.role._id.toString()) {
        throw ('Please refresh and retry')
    }



    var item = []
    const prisonerDoc = await global.dao.prisoner.find({ rid: rid, state: 0, type: 1 });

    // 获取战俘详细信息 
    var prisonerDocNew = []
    const role = await global.dao.role.findOne({ _id: rid });
    prisonerDoc.map(async e => {
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
    if (prisonerDocNew.length <= 0) {
        ctx.body = {
            message: "Please refresh and retry",
            item: item,
            prisoners: prisonerDocNew
        }
        return;
    }
    let result = await acquireLock(`${rid}-tianlao-inprogress`, 0, true)
    ctx.assert(!result, 'The current player is being intercepted');

    if (cacheInfo.destined > 0) {
        cacheInfo.destined -= 1
    } else {
        let result = prisonerItem(prisonerDoc)
        ctx.role.castItemsNoSave(result.ITEM);
        item = result.ITEM
        await ctx.role.save();
    }



    let time = global.gameconfig.surrenderfight[4][0].LEAVETIME * 60000 + Date.now()
    let record = await global.dao.prisonerRecord.create({ rid: rid, info: {}, opponent: ctx.role._id.toString(), state: 0, headid: ctx.role.headid, iconid: ctx.role.iconid, name: ctx.role.name, win: false })
    cacheInfo.battle.recordId = record.id
    cacheInfo.battle.target = rid
    cacheInfo.battle.battlecount = 0
    cacheInfo.battle.success = false
    cacheInfo.battle.itemInfo = []
    cacheInfo.battle.revive = 0
    cacheInfo.battle.time = time
    await expireUserinfo(key, false, cacheInfo)
    console.log("时间计算", time)

    let targetbattleset = await role.getBattleSet('normal');
    let tldefense = await role.getBattleSet('tldefense');

    let battleset = {}
    tldefense.power != 0 ? battleset = tldefense : battleset = targetbattleset,

        await acquireLock(`${rid}-tianlao-inprogress`, global.gameconfig.surrenderfight[4][0].LEAVETIME * 60000 + 120000)
    ctx.body = {
        message: "success",
        item: item,
        prisoners: prisonerDocNew,
        time: time,
        battleset

    }
};