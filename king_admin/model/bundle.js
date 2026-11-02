const {Schema} = require('mongoose');
/**
 * 渠道和包名数据
 * @param connMap
 * @return {*}
 */
module.exports = function (connMap, app) {
    const conn = connMap['main']; //
    const MSchema = new Schema({
        bundle: {
            type: String,
        }, // 渠道名
        channel: {
            type: String
        },
        group: { // 统计分组
            type: String
        },
        gameid: {
            type: String
        }
    });
    MSchema.index({
        bundle: 1
    }, {
        unique: 1,
        background: 1,
    });
    MSchema.statics.getChannel = async function (group) {
        let list = await this.find();
        let channelMap = {};
        list.forEach(b => channelMap[b.channel] = 1);
        list = Object.keys(channelMap).map(it => {
            it = {name: it};
            if (it.name.startsWith('songwo')) {
                it.group = 3; // songwo 为3
            } else if (it.name.startsWith('yy')) {
                it.group = 2; // yy
            } else {
                it.group = 1;
            }
            it.value = it.name;
            return it;
        })
        // const authInfo = await app.db.mongo.adminGroupAuth.findOne({group: group});
        // if (authInfo) {
        //     list = list.filter(c => authInfo.channel.includes(c.name));
        // }
        return list;
    };

    MSchema.statics.getGameIdList = async function (admin_role) {
        let gameidList;
        let authInfo;
        if (admin_role) {
            authInfo = __group__auth__cache__[admin_role] === undefined ? await app.db.mongo.adminGroupAuth.findOne({group: admin_role}) : __group__auth__cache__[admin_role];
        }

        if (authInfo) {
            gameidList = authInfo.channel;
        } else {
            let list = await this.find();
            let tmp = {};
            list.forEach(b => tmp[b.gameid] = 1);
            gameidList = Object.keys(tmp);
        }

        const list = gameidList.map(it => {
            it = {name: it};
            it.value = it.name;
            return it;
        })

        return list;
    };

    // 获取限制渠道
    MSchema.statics.limitChannel = async function (admin_role) {
        const authInfo = __group__auth__cache__[admin_role] === undefined ? await app.db.mongo.adminGroupAuth.findOne({group: admin_role}) : __group__auth__cache__[admin_role];
        __group__auth__cache__[admin_role] = authInfo;
        if (authInfo) {
            return authInfo.channel;
        }
        return null;
    }

    MSchema.statics.getBundles = async function (admin_role, no_group = false) {
        const match = {};

        const authInfo = __group__auth__cache__[admin_role] === undefined ? await app.db.mongo.adminGroupAuth.findOne({group: admin_role}) : __group__auth__cache__[admin_role];
        __group__auth__cache__[admin_role] = authInfo;
        if (authInfo) {
            match.gameid = {$in: authInfo.channel};
        }
        let list = await this.find(match);
        const out = list.map(l => l.bundle);
        if (!no_group) {
            const groups = {};
            list.forEach(l => {
                if (!l.group) return;
                groups[l.group] = groups[l.group] || [];
                groups[l.group].push(l.bundle);
            });

            for (const group in groups) {
                out.unshift({
                    name: group,
                    value: groups[group].join(',')
                })
            }
        }
        out.__is_all__ = !authInfo; // 表示是否被隔离
        return out;
    }
    // 解析并转换包名条件
    MSchema.statics.parseBundlesMatch = function (bundle) {
        if (Array.isArray(bundle)) {
            const tmp = {};
            bundle.forEach(t => {
                if (t.indexOf(',') > 0) {
                    for (const c of t.split(',')) {
                        tmp[c] = true;
                    }
                } else {
                    tmp[t] = true;
                }
            });
            return Object.keys(tmp);
        } else {
            return [bundle];
        }
    }
    return conn.model('Bundles', MSchema, 'Bundles');
}
