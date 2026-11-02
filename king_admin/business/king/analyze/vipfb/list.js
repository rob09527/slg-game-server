const ObjectId = require('mongodb').ObjectId;
exports.name = '分布查询';
exports.type = 'I';
exports.inherit = 'analyze-ltvmenus';


exports.exec = async function (body, query, ctx) {
    const {_page_, _sort_, servid, bundle, create, update, vip_filter} = body;
    // const {limit, current} = _page_;
    // const offset = (current - 1) * limit;
    const fb_type = query.type || 'vip';

    const $match = {};

    if (servid && servid !== 'ALL') {
        $match.servid = Number.parseInt(servid);
    } else {
        const servers = await this.service.game.serversOptions(ctx.adminRole);
        if (!servers.__is_all__)  // 被隔离了
            $match['servid'] = {
                $in: servers.map(s => s.value)
            }
    }

    if (bundle && bundle.length) {
        $match.bundle = {
            $in: this.db.mongo.bundle.parseBundlesMatch(bundle)
        };
    }

    if (create && create[1]) {
        const [start, end] = this.parseDateMatch(create);
        // 两边数据表时间格式不一样， 分开 写条件
        $match.create = {
            $gte: start,
            $lte: end
        };
    }

    if (vip_filter && vip_filter !== 'ALL') {
        $match[`hide.38003.count`] = {$gte: +vip_filter};
    }
    if (update && update[1]) {
        const [start, end] = this.parseDateMatch(update);
        // 两边数据表时间格式不一样， 分开 写条件
        $match.update = {
            $gte: start,
            $lte: end
        };
    }

    const sort = {};
    if (_sort_ && _sort_.field) {
        sort[_sort_.field] = _sort_.order;
    } else {
        sort._id = -1;
    }

    const opt = util.getRoleVipAndExpAgg(this.service.game.config, {[fb_type]: 1});
    const roleModel = await this.service.game.collection('roles');
    const agg = [
        {
            $match
        },
        {
            $project: {
                ...opt,
                uid: 1,
                _id: 1,
                servid: 1
            }
        },
        {
            $group: {
                _id: '$' + fb_type,
                count: {
                    $sum: 1
                }
            }
        }
    ];
    const itemc = await roleModel.aggregate([
        ...agg,
        {
            $sort: sort,
        }
    ], {allowDiskUse: true});
    const items = await itemc.toArray();

    return {
        items: items,
        total: items.length
    }
};

