exports.name = '批量修改';
exports.type = 'I';
exports.inherit = 'cdkeys-create';

exports.exec = async function (body, query, ctx) {
    let {
        name, rewardStr, start, end,
        remain = 1, limit = 1, level = 1,
        bundles = [], channels = [], servids = []
    } = body;
    const {del = 0} = query;

    const cdkeyModel = await this.service.game.collection('cdkeys');
    // 删除多个礼包码
    if (del) {
        const r = await cdkeyModel.deleteMany({name});
        return r;
    }
    // 修改多个礼包码
    if (!start || !end) {
        throw "时间必须选择"
    }
    start = Date.parse(start);
    end = Date.parse(end);
    const items = util.parseRewardStr(rewardStr);
    remain = Number.parseInt(remain);
    limit = Number.parseInt(limit);
    level = Number.parseInt(level);
    const $set = {remain, limit, level, items, start, end};
    const $unset = {};
    if (channels.length > 0) {
        $set.channels = channels;
    } else {
        $unset.channels = 1;
    }
    if (bundles.length > 0) {
        $set.bundles = this.db.mongo.bundle.parseBundlesMatch(bundles);
    } else {
        $unset.bundles = 1;
    }
    if (servids.length > 0) {
        $set.servids = servids.map(s => s.split(",")).reduce((sum, cur) => sum.concat(cur)).map(v => Number.parseInt(v));
    } else {
        $unset.servids = 1;
    }
    const r = await cdkeyModel.updateMany({name}, {$set, $unset});
    return r;
};

