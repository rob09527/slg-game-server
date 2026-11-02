'use strict'

module.exports = exports = async function (role, pid) {
    const [_, index, type] = pid.split('_');
    let userconfig = role.cjzmsyh['lglb']['reward'][type]
    //设置领取标记
    userconfig[index].use = true
    //设置领取顺序标记
    userconfig.index = index
    let item = userconfig[index].item
    if (!userconfig) throw new Error('miss lglb config:', pid, " index:", index);

    let insert = {}
    role.cjzmsyh['lglb'].spcount += userconfig[index].spcount
    insert[`cjzmsyh.lglb`] = role.cjzmsyh['lglb']
    await global.dao.role.updateOne({ _id: role.id }, { $set: insert })

    return [item, userconfig[index].PRICE, true]
}
