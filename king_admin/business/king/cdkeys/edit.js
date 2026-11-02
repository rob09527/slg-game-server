exports.name = '礼包码编辑';
exports.type = 'I';
exports.inherit = 'cdkeys-create';

const {ObjectID} = require("mongodb");

exports.exec = async function (body, query, ctx) {
    let {
        _id, servid,
        start, end, limit = 1, remain = 1, items, name, level = 1,
        bundles, servids, channels, key,
    } = body;
    remain = Number.parseInt(remain);
    limit = Number.parseInt(limit);
    level = Number.parseInt(level);
    const $set = {
        start: Date.parse(start),
        end: Date.parse(end),
        limit, name, level, key, items,
    }
    if (!name || name.indexOf(".") > -1 || name.indexOf("&") > -1) {
        throw "礼包名不能有非法字符"
    }
    if (!key || !/^[a-zA-Z0-9]+$/.test(key)) {
        throw 'key 只能为英文和数字'
    }

    const $unset = {};
    if (channels && channels.length > 0) {
        $set.channels = channels;
    } else {
        $unset.channels = 1;
    }
    if (bundles && bundles.length > 0) {
        $set.bundles = this.db.mongo.bundle.parseBundlesMatch(bundles);
    } else {
        $unset.bundles = 1;
    }
    if (servids && servids.length > 0) {
        $set.servids = servids.map(v => Number.parseInt(v));
    } else {
        $unset.servids = 1;
    }

    const cdkeyModel = await this.service.game.collection('cdkeys');
    const r = await cdkeyModel.updateOne({_id: ObjectID(_id)}, {$set, $unset});
    return r;
};

