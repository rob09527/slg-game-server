exports.name = '包名查询';
exports.type = 'I';
exports.inherit = 'bundle-view'; // 权限继承于同功能组的 notice


exports.exec = async function (body, query, ctx) {

    const {_page_, channel} = body;
    const opt = {};
    const {limit, current} = _page_;
    const offset = (current - 1) * limit;
    if (channel) {
        opt.channel = channel;
    }

    const bundleModel =  await this.db.mongo.bundle;

    let items = await bundleModel.find(opt).sort({_id: -1}).skip(offset).limit(+limit);

    const total = await bundleModel.count(opt);

    return {
        items,
        total
    }
};

