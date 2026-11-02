const ObjectId = require('mongodb').ObjectId;
exports.name = '强更更资源发布';
exports.type = 'N';

exports.exec = async function (body, query, ctx) {

    const qzupds = await this.service.game.collection('qzupds');
    const { _id, version, platform, gameid, url, create } = body;
    const result = await qzupds.findOne({ version, gameid })
    if (result) {
        throw ('版本号码和gameid组成的key 重复了')
    }
    const one = await qzupds.findOneAndUpdate({ version, gameid }, { $set: { status: 0, gameid, version, url, create: create ?? new Date() } }, { upsert: true });
    this.remote.proxy_load_cache("qzupd");
    return one
};







