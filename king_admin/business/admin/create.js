exports.name = '创建管理员';
exports.type = 'N';
exports.exec = async function (body, query, ctx) {

    const {name, email, group} = body;
    if (!name) {
        throw '无效的名称'
    } else if (!email) {
        throw '无效的邮件'
    } else if (!group || group === 'ALL') {
        throw '无效的部门'
    } else if (group === 'SUPER_MANAGER') {
        throw 'SUPER_MANAGER-CAN-NOT-CREATE'
    }
    let r = await this.service.admin.create({name, email, group});
    //
    return r;
}
