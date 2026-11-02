exports.name = '部门权限细化设置';
exports.type = 'I';
exports.inherit = 'create';
exports.exec = async function (body, query, ctx) {
    const {group_name, serv, channel} = body;
    if (!group_name){
        throw '请选择部门'
    }

    const hasChannel = channel && channel.length;
    const adminGroupAuth  = this.db.mongo.adminGroupAuth;
    if (!serv && !hasChannel){ // 清空细化权限
        await adminGroupAuth.deleteOne({
            group: group_name
        })
        return "OK";
    }

    const [min, max] = serv.split('~');
    if (isNaN(min)){
        throw '无效的服务器id:' + min
    }
    if (isNaN(max)){
        throw '无效的服务器id:' + max
    }

    await adminGroupAuth.findOneAndUpdate({
        group: group_name
    }, {
        $set: {
            serv: {
                min: +min,
                max: +max
            },
            channel
        }
    }, {
        upsert: true
    })
    global.__group__auth__cache__ = {};
    return "OK";
}
