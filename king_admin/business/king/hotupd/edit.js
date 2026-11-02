const ObjectId = require('mongodb').ObjectId;
exports.name = '热更资源发布';
exports.type = 'N';

exports.exec = async function (body, query, ctx) {

    const hotupds = await this.service.game.collection('hotupds');

    if (query.status) { // 发布调用
        const {_id, version, platform} = body;
        const one = await hotupds.findOneAndUpdate({platform, status: +query.status}, {$set: {status: 0}});
        const $set = {status: +query.status};
        if (parseInt(one.version) > parseInt(version)) { // 之前的版本大于当前的版本
            $set.force_cb = 1; // 标记强制回退
        }
        // 更新逻辑
        let r;
        if (_id) {
            r = await hotupds.updateOne({_id: ObjectId(_id)}, {$set});
        }
        else {
            r = await hotupds.updateOne({platform, version}, {$set});
        }
        this.remote.proxy_load_cache("hotupd");
        return r;
    }

    const {whitelist_str} = body;
    const whitelist = {};
    whitelist_str.split(',').forEach(w => {
        whitelist[w] = 1;
    })
    const r = await hotupds.updateOne({status: -1}, {$set: {whitelist: whitelist}}, {upsert: true});
    this.remote.proxy_load_cache("hotupd");
    return r;
};

