exports.name = '创建礼包码';
exports.type = 'N';
const moment = require('moment');

const _gen_key = function () {
    var str = Date.now().toString();
    str = str.slice(-8);
    str = Math.ceil(parseInt(str.split('').reverse().join('')) * Math.random()).toString(24);
    if (str.length < 6) {
        let bit = 6 - str.length;
        for (let i = 0; i < bit; i++) {
            str = '0' + str;
        }
    }
    return str.toUpperCase();
}
const create = async function (ctx, model, opts) {
    ctx.assert(opts.name, 'missing name');
    ctx.assert(opts.items && opts.items.length > 0, 'items err');
    for (let item of opts.items) {
        item.COUNT = parseInt(item.COUNT);
    }
    if (opts.start) opts.start = moment(opts.start).valueOf();
    if (opts.end) opts.end = moment(opts.end).valueOf();


    let {count = '0'} = opts;
    count = parseInt(count) || 1;
    delete opts['count'];
    opts.limit = +(opts.limit || 1);
    opts.remain = +(opts.remain || 1);
    opts.level = + (opts.level || 1);
    opts.pause = false;
    opts.start = opts.start || Date.now();
    opts.end = opts.end || 2222222222222;
    opts.create = Date.now();
    let cdkeys = [];
    console.log("CDKEY_CREATE", JSON.stringify({count, opts}))
    while (cdkeys.length < count) {
        const key = _gen_key();
        let one = await model.count({key});
        if (one) continue;
        opts.key = key;
        delete opts._id;
        await model.insertOne(opts);
        cdkeys.push(one.key);
    }

    ctx.assert(cdkeys.length > 0, 'gen fail');
}
exports.exec = async function (body, query, ctx) {

    let {bundles = [], channels = [], name, servids = [], level, start, end, limit, remain, count, rewardStr} = body;
    console.log(body)
    const items = util.parseRewardStr(rewardStr);
    if (!Array.isArray(bundles)) bundles = [bundles];
    if (!Array.isArray(channels)) channels = [channels];
    if (!name || name.indexOf(".") > -1 || name.indexOf("&") > -1) {
        throw "礼包名不能有非法字符"
    }
    const data = {
        name, level, start, end, limit: limit || 1, remain, count, items
    }
    if (bundles.length > 0) {
        data.bundles = this.db.mongo.bundle.parseBundlesMatch(bundles);
    }
    if (servids.length > 0) {
        data.servids = servids.map(s => s.split(",")).reduce((sum, cur) => sum.concat(cur)).map(v => Number.parseInt(v));
    }
    if (channels.length > 0) {
        data.channels = channels;
    }
    console.log(data);
    const cdkeyModel = await this.service.game.collection('cdkeys');
    await create(ctx, cdkeyModel, data);

    return "OK";
};

