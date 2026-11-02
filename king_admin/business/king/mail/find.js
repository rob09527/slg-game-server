exports.name = '邮件数据查询';
exports.type = 'I';
exports.inherit = 'mail-view';

const fromMap = {
    sys: '系统',
    legion: '军团',
    role: '好友'
};
exports.exec = async function (body, query, ctx) {

    const {_page_, _sort_, create, from, title, uid} = body;
    const servid = (body.servid !== 'ALL' && body.servid) ? +body.servid : null;
    const {limit, current} = _page_;


    const offset = (current - 1) * limit;
    const opt = {};

    if (title) {
        opt.title = title;
    }
    if (create && create[1]) {
        const [start, end] = this.parseDateMatch(create);
        opt.create = {$gte: start, $lte: end}
    }

    if (from && from !== 'ALL') {
        opt['from.type'] = from;
    }
    const sort = {};
    if (_sort_ && _sort_.field) {
        sort[_sort_.field] = _sort_.order;
    } else {
        sort._id = -1;
    }
    if (uid) {
        const roleOpt = {};
        if (isNaN(uid)) {
            roleOpt.uid = uid;
        } else if (uid.length < 8) {
            roleOpt.rno = +uid;
        } else {
            roleOpt.uid = uid;
        }
        if (servid) {
            roleOpt.servid = +servid;
        } else {
            const servers = await this.service.game.serversOptions(ctx.adminRole);
            roleOpt['servid'] = {
                $in: servers.map(s => s.value)
            }
        }
        const roleModel = await this.service.game.collection('roles');
        const role = await roleModel.findOne(roleOpt);
        if (!role) {
            return {
                items: [],
                total: 0
            }
        }
        opt.rid = role._id + '';
    } else if (servid) {
        const roleModel = await this.service.game.collection('roles');
        const arrc = await roleModel.find({servid: +servid}).project({_id: 1});
        const roles = await arrc.toArray();
        opt.rid = {$in: roles.map(r => r._id + '')}
    } else {
        const servers = await this.service.game.serversOptions(ctx.adminRole);
        if (!servers.__is_all__) { // 被隔离了的就不查询全服邮件
            return {
                items: [],
                total: 0
            }
        }
    }

    const mailModel = await this.service.game.collection('mails');
    const cursor = await mailModel.aggregate([
        {
            $match: opt,
        },
        {
            $sort: sort
        },
        {
            $skip: offset
        },
        {
            $limit: +limit
        },
        {
            $lookup: {
                from: "roles", // 关联角色
                let: {role_id: {$toObjectId: "$rid"}},
                pipeline: [
                    {$match: {$expr: {$eq: ["$_id", "$$role_id"]}}},
                    {
                        $project: {
                            servid: 1,
                            rname: 1,
                            rno: 1,
                            uid: 1
                        }
                    },
                ],
                as: "role"
            },
        },
        {$unwind: "$role"},
    ])

    const items = await cursor.toArray();

    items.forEach(item => {
        item.servid = item.role.servid;
        item.statusStr = (item.state === 3 || item.create === 1111111111111) ? `<span style="color: red">已删除</span>` :
            item.state === 1 ? `<span style="color: deeppink">已读取</span>` :
                item.state === 2 ? `<span style="color: deeppink">已领取</span>` :
                    `<span style="color: green">未领取</span>`;
        item.from_str = item.from ? (fromMap[item.from.type] || item.from.type) : '';
        if (item.reward && item.reward.length) {
            item.rewardStr = item.reward.map(one => `${one.GSID || one.gsid}*${one.COUNT || one.count}`).join(',');
        }
    })
    const total = await mailModel.countDocuments(opt);
    return {
        items: items,
        total: total
    }
};

