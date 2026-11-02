const ObjectId = require('mongodb').ObjectId;
exports.name = '热更资源删除';
exports.type = 'N';

exports.exec = async function (body, query, ctx) {
    const hotupds = await this.service.game.collection('hotupds');
    // 删除未发布,status=0
    const {_id, version, platform} = body;
    // 删除
    let r;
    if (_id) {
        r = await hotupds.removeOne({_id: ObjectId(_id), status: 0});
    }
    else {
        r = await hotupds.removeOne({platform, version, status: 0});
    }
    this.remote.proxy_load_cache("hotupd");
    return r;
};

