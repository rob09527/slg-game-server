const fs = require('fs');
const moment = require('moment');
exports.name = '公告查询';
exports.type = 'I';
exports.inherit = 'notice-view'; // 权限继承于同功能组的 notice

const FORMAT = 'YYYY-MM-DD HH:mm:ss';

exports.exec = async function (body, query, ctx) {

    const {_page_, bundle, type, _sort_} = body;
    const opt = {};
    const {limit, current} = _page_;
    const offset = (current - 1) * limit;

    if (bundle) {
        opt.bundle = {
            $in: this.db.mongo.bundle.parseBundlesMatch([bundle])
        };
    } else {
        const bundles = await this.db.mongo.bundle.getBundles(ctx.adminRole, true);
        if (!bundles.__is_all__) opt.bundle = {$in: bundles}
    }
    if (type && type !== 'ALL') {
        opt.type = type;
    }
    const noticeModel = await this.service.game.collection('notices');
    let items = await noticeModel.find(opt).project({content: 0}).sort({_id: -1}).skip(offset).limit(+limit);
    items = await items.toArray();
    items = items.map(item => {
        if (item.maintain_etime) {
            item.maintain_etime = moment(item.maintain_etime).format(FORMAT);
        }
        item.status = item.status === 2;
        item.bundle = item.bundle || [];
        item.sid = item.servid ? (item.servid[0] + '...') : '';
        item.servers = item.servid && item.servid.join(',');
        item.bundle_str = item.bundle && item.bundle.join(',');
        return item;
    })
    const total = await noticeModel.count(opt);

    return {
        items,
        total
    }
};

