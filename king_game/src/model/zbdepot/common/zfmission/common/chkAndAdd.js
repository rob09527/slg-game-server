
'use strict'

module.exports = async function ({ zbId, mark, count = 1, subreason = 'unknow' }) {
    const zhenbaoModel = this.db.models.zhenbao;
    const roleModel = this.db.models.role;
    const zhenbao = await zhenbaoModel.findOne({ rid: this.rid, zbId })
    if (!zhenbao) return;
    const role = await roleModel.findOne({ _id: this.rid });
    if (!role) return;
    await role.addItemsNoSave({ gsid: mark, count }, `zbm:${subreason}`)
    await role.save();
}