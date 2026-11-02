exports.name = '包名增删';
exports.type = 'N';
exports.exec = async function (body, query, ctx) {
    const {channel, gameid, group = '', bundle} = body;
    if (!bundle) {
        throw 'miss bundle';
    }
    if (!channel) {
        throw 'miss channel';
    }
    const bundleModel = await this.db.mongo.bundle;

    if (query.del) { // 删除包名操作
        const r = await bundleModel.deleteOne({_id: body._id});
        return r;
    }
    if (body._id) { // 编辑包名
        await bundleModel.updateOne({_id: body._id}, {
            $set: {
                bundle: bundle.trim(),
                channel: channel.trim(),
                group: group.trim(),
                gameid: gameid ? gameid.trim() : gameid
            }
        });
        return;
    }
    const r = await bundleModel.create({
        bundle: bundle.trim(),
        channel: channel.trim(),
        group: group.trim(),
        gameid: gameid ? gameid.trim() : gameid
    });

    return r;
};

