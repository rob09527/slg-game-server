exports.name = '权限修改';
exports.type = 'N';
exports.exec = async function (body, query, ctx) {
    const {group, admin_id, actions} = body;
    const adminId = admin_id;
    if (adminId === 1 && group === 'admin') {
        throw '超级管理员权限不能修改';
    }
    //
    const r = await this.service.admin.changeActions(adminId, group, actions);

    if (mSession[adminId] && mSession[mSession[adminId]]) { // 该管理员处于登录状态, 清空缓存的权限
        const customSession = mSession[mSession[adminId]];
        customSession.actionSet = null;
    }
    return r;
}
