const ObjectId = require('mongodb').ObjectId;
exports.name = '渠道设置创建';
exports.type = 'N';

exports.exec = async function (body, query, ctx) {
    const {gameid, name, appkey, appsecret, url} = body;
    const channels = await this.service.game.collection('channels');
    const r = await channels.updateOne({gameid}, {$set:{name, appkey, appsecret, url}}, { upsert:true });
    this.remote.proxy_load_cache("channel");
    return r;
};

