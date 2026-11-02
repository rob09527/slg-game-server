exports.name = '公告创建';
exports.type = 'N';
exports.exec = async function (body, query, ctx) {

    const {title, type, servid} = body;
    let bundle = body.bundle;
    if (!title) {
        throw 'miss title';
    }
    if (!bundle) {
        bundle = ['ALL'];
    } else {
        bundle = Array.isArray(bundle) ? bundle : [bundle];
        if (bundle.includes('ALL')) {
            bundle = ['ALL'];
        } else if (!bundle.length) {
            bundle = ['ALL'];
        } else {
            bundle = this.db.mongo.bundle.parseBundlesMatch(bundle);
        }
    }

    if (type && global.NORICE_TYPS) {
        if (!global.NORICE_TYPS.includes[type]) {
            global.NORICE_TYPS.push(type);
        }
    }

    const noticeModel = await this.service.game.collection('notices');
    const obj = {
        title,
        bundle: bundle,
        type: type || 'default',
        status: 0,
        create: Date.now()
    };
    if (servid) {
        obj.servid = servid.map(Number)
    }
    const r = await noticeModel.insertOne(obj);
    this.remote.proxy_load_cache("notice");
    return r;
};

