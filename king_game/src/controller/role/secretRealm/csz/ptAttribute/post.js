'use strict';


module.exports = exports = async (ctx) => {
    let { id } = ctx.request.body;
    let secretRealm = ctx.role.secretRealm
    let csz = secretRealm.csz
    let atpre = csz.atpre
    let config = global.gameconfig.secretRealm[0].find(e => e.ID == id)
    ctx.assert(config, 'invalid config secretRealm');
    ctx.assert(!atpre[id], 'repeated activation');
    let checklist = []
    global.gameconfig.secretRealm[0].forEach(e => {
        if (e.SKIP == 0 && e.ID < id) {
            checklist.push(e.ID)
        }
    });
    checklist.forEach(e => {
        ctx.assert(atpre[e], `Not unlocked${e}`);
    })
    ctx.role.castItemsNoSave(config.item);
    await ctx.role.save()
    csz.pre[config.ATT] ? csz.pre[config.ATT] += config['A_COUNT_0'] : csz.pre[config.ATT] = config['A_COUNT_0']
    atpre[id] = true
    let insert = {}
    insert['secretRealm.csz'] = csz
    await ctx.role.updateOne({ $set: insert });
    ctx.body = 'success'
};
