const ObjectId = require('mongodb').ObjectId;
exports.name = '强更模块更新权限';
exports.type = 'N';

exports.exec = async function (body, query, ctx) {
    const qzupds = await this.service.game.collection('qzupds');
    if (query.status) { // 发布调用
        const { _id, version, gameid } = body;
        const one = await qzupds.findOneAndUpdate({ gameid, status: +query.status }, { $set: { status: 0 } });
        const $set = { status: +query.status };
        // 更新逻辑
        let r;
        if (_id) {
            r = await qzupds.updateOne({ _id: ObjectId(_id) }, { $set });
        }
        else {
            r = await qzupds.updateOne({ version, gameid }, { $set });
        }
        this.remote.proxy_load_cache("qzupd");
        return r;
    }

    const { whitelist_str } = body;
    const whitelist = {};
    whitelist_str.split(',').forEach(w => {
        whitelist[w] = 1;
    })
    const r = await qzupds.updateOne({ status: -1 }, { $set: { whitelist: whitelist } }, { upsert: true });
    this.remote.proxy_load_cache("qzupd");
    return r;
};