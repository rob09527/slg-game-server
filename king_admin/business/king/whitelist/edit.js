exports.name = '白名单增删管理';
exports.type = 'N';

exports.exec = async function (body, query, ctx) {

    const whitelistModel = await this.service.game.collection('whitelists');

    const roleModel = await this.service.game.collection('roles');
    if (!body.uid) {
        throw "MISS UID"
    }
    if (query.del) {
        // 删除逻辑
        await roleModel.updateMany({ uid: body.uid }, { $set: { white: false } })
        const r = await whitelistModel.deleteOne({ uid: body.uid });

        this.remote.proxy_load_cache("whitelist");
        return r;
    }
    await roleModel.updateMany({ uid: body.uid }, { $set: { white: true } })
    const r = await whitelistModel.insertOne({
        uid: body.uid,
        create: Date.now()
    })
    this.remote.proxy_load_cache("whitelist");
    return r;
};

