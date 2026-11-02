exports.name = '删除全服日志';
exports.type = 'N';

const {ObjectID} = require("mongodb");
exports.exec = async function (body, query, ctx) {
    const {create, servid, uid, title, type , from} = body; //  update,

    const opt = {};

    if (type && type !== 'ALL') {
        opt.type = +type;
    }

    if (create && create[1]) {
        const [start, end] = this.parseDateMatch(create);
        opt.create = {$gte: start, $lte: end}
    }

    if (from && from !== 'ALL') {
        opt['from.type'] = from;
    }

    const roleModel = await this.service.game.collection('roles');
    if (uid) {
        if (!servid || servid == 'ALL') {
            throw '需单服查询';
        }
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
        }

        const role = await roleModel.findOne(roleOpt);
        if (!role) {
            throw '未找到该角色'
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
    if (title) {
        opt.title = new RegExp(title);
    }
    if (!opt.title || !opt.create) {
        throw '必须设置标题条件和创建时间条件'
    }

    let total = 0;

    let mailOpt = {...opt};
    const mails = await this.service.game.collection('mails');
    const r = await mails.updateMany(mailOpt, {$set: {state: 3}});
    total += r.n;

    return {
        total: total
    }
};

