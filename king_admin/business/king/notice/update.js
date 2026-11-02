const {ObjectId} = require("mongodb");

exports.name = '公告编辑';
exports.type = 'N';
exports.exec = async function (body, query, ctx) {
    const {title, content, type, servid} = body;
    let status = body.status;
    const noticeModel = await this.service.game.collection('notices');
    const opt = {};
    const update = {};

    opt._id = ObjectId(body._id || query.id || body.rowData._id);

    if (content) {
        update.content = content; // 内容修改
    } else if (title) {
        update.title = title; // 内容修改
    }
    let bundle = body.bundle;
    if (bundle !== undefined) {
        bundle = Array.isArray(bundle) ? bundle : [bundle];
        if (bundle.includes('ALL')) {
            bundle = ['ALL'];
        } else if (!bundle.length) {
            bundle = ['ALL'];
        } else {
            bundle = this.db.mongo.bundle.parseBundlesMatch(bundle);
        }
        update.bundle = bundle;
    }
    if (type) {
        update.type = type;
    }
    if (servid) {
        update.servid = servid ? servid.map(Number) : undefined;
    }
    if (+query.status === 3) {
        const r = await noticeModel.deleteOne(opt, {$set: update});
        this.remote.proxy_load_cache("notice");
        return r;
    }

    if (status !== undefined) {

        if (status === true) {
            status = 2;
        } else {
            status = 0;
        }
        update.status = +status;
    }
    const r = await noticeModel.updateOne(opt, {$set: update});
    this.remote.proxy_load_cache("notice");
    return r;
};

