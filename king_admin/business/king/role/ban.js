const {ObjectId} = require("mongodb");
exports.name = '账号封停操作';
exports.type = 'N';
exports.exec = async function (body, query, ctx) {

    const {days = 365, from} = body;
    let servid = body.servid;
    let uid = body.uid;
    let rid = body.rid;
    if (from) { // 兼容聊天界面的数据格式
        rid = from.rid;
        const roles = await this.service.game.collection('roles');
        const role = await roles.findOne({_id: ObjectId(rid)});
        if (!role) {
            throw '角色可能已经被删除';
        }
        uid = role.uid;
        servid = role.servid;
    }
    const banModel = await this.service.game.collection('bans');
    let r;
    if (query.del) {
        r = await banModel.deleteOne({uid});
    } else {
        r = await banModel.findOneAndUpdate({uid}, {
            $set: {
                expired: Date.now() + (Number(days) || 365) * 24 * 3600 * 1000,
                create: Date.now()
            }
        }, {
            upsert: true
        });
        // 封号会踢下线
        const tokenModel = await this.service.game.collection('tokens');
        await tokenModel.updateOne({uid, servid: +servid}, {$set: {update: -1}});
        await this.remote.closeClient(rid, null, 4102, 'gm kick'); //
    }
    this.remote.proxy_load_cache("ban");
    return r;
};

