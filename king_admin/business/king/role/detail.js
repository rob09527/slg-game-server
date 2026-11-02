exports.name = '角色详情';
exports.type = 'I';
exports.inherit = 'role-view';
const {ObjectId} = require('mongodb');
const moment = require('moment');

const spName = {
    bw: '霸王特权', qz: '亲政爱民', zx: '招贤纳士',
    lm: '军团特权', yd: '月度特权', cz: '成长基金',
    gz: '贵族月卡', zz: '超级月卡', tower: '试练塔基金',
}
const bigBattle = {
    "0": "赤壁之战",
    "1": "夷陵之战",
    "2": "合肥之战",
}
const shopName = {
    'day': '每日商店',
    'pvp': '演武商店',
    'legion': '军团商店',
    'decomp': '遣散商店',
    'star': '观星商店',
    'general': '点将商店',
    'kill': '远征商店',
    'offical': '威望商店',
    'nation': '国战商店',
    'skin': '皮肤商店',
    'pearl': '珍宝商店',
    'maze': '远征随机商店',
}

exports.exec = async function (body, query, ctx) {
    const role = await this.remote.agent_findrole({_id: body._id});
    body = role;
    body._id = role.id;

    const arr = await this.remote.isonline(role.id); // 执行游戏实例远程函数 isonline,
    const onlineinfo = arr.filter(Boolean)[0];
    let isonline = onlineinfo ? `在线 <ws://${onlineinfo}>` : '离线'; // 返回结果集中，只要有一个实例显示在线则在线

    const baseRoleStr = JSON.stringify({...role, others: undefined, props: undefined}, null, 4);
    const others = role.others;
    const props = role.props || {};
    Object.assign(props, role.hide, others);
    const MBossModel = await this.service.game.collection('mbosses');
    const mbossCursor = await MBossModel.find({rid: body._id}).project({index: 1, entime: 1, _id: 0});
    const mbosses = await mbossCursor.toArray();
    const shopModel = await this.service.game.collection('c_shops');
    const shopCursor = await shopModel.find({rid: body._id, refresh: {$exists: 1}}).project({
        _id: 0,
        type: 1,
        refresh: 1
    });
    const c_shop = await shopCursor.toArray();
    const mazeModel = await this.service.game.collection('mazeinfos');
    const mazeCursor = await mazeModel.find({rid: body._id}).project({_id: 0, nextreftime: 1});
    const maze = await mazeCursor.toArray();

    const recruitModel = await this.service.game.collection('c_recruits');
    const recruitCursor = await recruitModel.find({rid: body._id}).project({_id: 0, buslist: 1});
    let recruit = await recruitCursor.toArray();
    // 卧龙战令
    const warorderModel = await this.service.game.collection('warorders');
    const warorderCursor = await warorderModel.find({rid: body._id}).project({_id: 0, start: 1, end: 1});
    let warorder = await warorderCursor.toArray();
    let refreshTime = [
        {
            title: '月度狂欢',
            value: moment(role.ydend).format('YYYY-MM-DD HH:mm:ss')
        },
        {
            title: '远征赏金阁',
            value: moment(role.mazeend).format('YYYY-MM-DD HH:mm:ss')
        },
        {
            title: '日常赏金阁',
            value: moment(role.bountyend).format('YYYY-MM-DD HH:mm:ss')
        },
    ]
    for (const mboss of mbosses) {
        refreshTime.push({
            title: `大战役 ${bigBattle[mboss.index]}`,
            value: `${moment(mboss.etime).format('YYYY-MM-DD HH:mm:ss')}`
        })
    }
    for (const {type, refresh} of c_shop) {
        refreshTime.push({
            title: `${shopName[type]}`,
            value: moment(refresh).format('YYYY-MM-DD HH:mm:ss')
        });
    }
    for (const {nextreftime} of maze) {
        refreshTime.push({
            title: `远征下次刷新时间`,
            value: `${moment(nextreftime).format('YYYY-MM-DD HH:mm:ss')}`
        })
    }
    for (const {start, end} of warorder) {
        refreshTime.push({
            title: `卧龙战令开始时间`,
            value: `${moment(start).format('YYYY-MM-DD HH:mm:ss')}`
        })
        refreshTime.push({
            title: `卧龙战令结束时间`,
            value: `${moment(end).format('YYYY-MM-DD HH:mm:ss')}`
        })
    }

    const makePropsStr = () => {
        let s = '';
        let i = 0;
        for (let k in props) {
            const count = props[k].count;
            const ct = `${k}*${count}\t`;
            s += ct;
            i++;
            if (count < 10) {
                s += '\t\t';
            } else if (count < 99999) {
                s += '\t';
            }
            if (i >= 6) {
                s += '\n';
                i = 0;
            }
        }
        return s;
    }


    let general_html = JSON.stringify(role.general, null, 4);
    let special = []
    for (let [key, val] of Object.entries(body.special || {})) {
        let value = val == 0 ? '无' : moment(val).format('YYYY-MM-DD HH:mm:ss');
        if (key == 'gz' || key == 'zz') {
            value = '剩余 ' + val + ' 天'
        }
        special.push({
            title: spName[key],
            value,
        })
    }
    special = [...special, {
        title: '日常赏金阁特权',
        value: `${body.rewardcup && body.rewardcup.sjg ? '拥有 购买时间=>' + moment(body.rewardcup.sjg).format('YYYY-MM-DD HH:mm:ss') : '无'}`
    }, {
        title: '远征赏金阁特权',
        value: `${body.rewardcup && body.rewardcup.maze ? '拥有 购买时间=>' + moment(body.rewardcup.maze).format('YYYY-MM-DD HH:mm:ss') : '无'}`
    }]
    if (recruit.length > 0) {
        recruit = recruit[0];
        if (recruit.buslist) {
            const active = others[93197];
            const num = others[93198] ? others[93198].count : 0;
            const desc = `抽取次数${num},武将：${recruit.buslist.join(",")}`;
            let value = !active && !num ? '未激活' : (active ? desc : `已领取 ${desc}`);
            special.push({
                title: "300抽",
                value,
            })
        }
    }

    let legionName = "";
    if (role.legion) {
        const legions = await this.service.game.collection('legions');
        const legion = await legions.findOne({_id: ObjectId(role.legion)});
        if (legion) {
            legionName = legion.name;
        }
    }
    return {
        width: '65%',
        children: {
            _type: 'Tabs',
            defaultActiveKey: "1",
            children: [
                {
                    _type: 'Tabs.TabPane',
                    tab: '角色信息',
                    key: '1',
                    children: {
                        _type: 'AkDetail',
                        data: [
                            {
                                title: '昵称',
                                value: body.rname,
                            },
                            {
                                title: '短号',
                                value: body.rno,
                            },
                            {
                                title: '在线状态',
                                value: isonline,
                            },
                            {
                                title: 'UID',
                                value: body.uid,
                            },
                            {
                                title: '所在军团',
                                value: legionName
                            },
                            {
                                title: '最高主线关卡',
                                value: role.maxmapid,
                            },
                            {
                                title: '试练塔最高关卡',
                                value: role.tower,
                            },
                            {
                                title: '一骑当千',
                                value: `历史最高关卡 ${body.dgtop ? body.dgtop.chapter + 1 : 1},最后更新时间 ${body.dgtop ? moment(body.dgtop.update).format('YYYY-MM-DD HH:mm:ss') : '无'}`,
                            },
                        ]
                    },
                },
                {
                    _type: 'Tabs.TabPane',
                    tab: '特权信息',
                    key: '2',
                    children: {
                        _type: 'AkDetail',
                        data: special
                    },
                },
                {
                    _type: 'Tabs.TabPane',
                    tab: '刷新时间',
                    key: '3',
                    children: {
                        _type: 'AkDetail',
                        data: refreshTime,
                    },
                },
                {
                    _type: 'Tabs.TabPane',
                    tab: '数据模式',
                    key: '4',
                    children: {
                        _type: 'CodeEditor',
                        readOnly: true,
                        language: 'json',
                        defaultHeight: 300,
                        theme: 'vs',
                        value: baseRoleStr,
                    }
                },
                {
                    _type: 'Tabs.TabPane',
                    tab: '道具标记',
                    key: '5',
                    children: {
                        _type: 'CodeEditor',
                        value: makePropsStr(),
                        readOnly: true,
                        language: 'json',
                        defaultHeight: 300,
                        theme: 'vs'
                    }
                },
                {
                    _type: 'Tabs.TabPane',
                    tab: '武将数据',
                    key: '6',
                    children: {
                        _type: 'CodeEditor',
                        readOnly: true,
                        language: 'json',
                        defaultHeight: 300,
                        theme: 'vs',
                        value: general_html
                    }
                }
            ]
        }
    }
};

