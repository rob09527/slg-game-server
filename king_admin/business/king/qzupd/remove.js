const ObjectId = require('mongodb').ObjectId;
exports.name = '强更资源删除';
exports.type = 'N';

exports.exec = async function (body, query, ctx) {
    const hotupds = await this.service.game.collection('qzupds');
    // 删除未发布,status=0
    const { _id, version, gameid } = body;
    // 删除
    let r;
    if (_id) {
        r = await hotupds.removeOne({ _id: ObjectId(_id) });
    }
    else {
        r = await hotupds.removeOne({ version, gameid });
    }
    this.remote.proxy_load_cache("qzupd");
    return r;
};

