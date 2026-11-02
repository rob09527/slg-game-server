const ObjectId = require('mongodb').ObjectId;
exports.name = 'IOS审核发布';
exports.type = 'N';

exports.exec = async function (body, query, ctx) {
    const iosversions = await this.service.game.collection('iosversions');
    const {_id, version, gameid, status} = body;
    const upd = query.status == null ? (status == null ? 0 : status) : query.status
    let r;
    if (+upd < 2){
         // 更新逻辑
        const $set = {status: +upd};
        if (_id) {
            r = await iosversions.updateOne({_id: ObjectId(_id)}, {$set}, { upsert:true });
        }
        else {
            r = await iosversions.updateOne({gameid, version}, {$set}, { upsert:true });
        }
    }
    else {
        // 删除逻辑
        if (_id) {
            r = await iosversions.removeOne({_id: ObjectId(_id)});
        }
        else {
            r = await iosversions.removeOne({gameid, version});
        }
    }
    this.remote.proxy_load_cache("version");
    return r;

};

