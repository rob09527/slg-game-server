exports.name = '角色操作框';
exports.type = 'I';
exports.inherit = 'role-view';

// 跳关选项
const jumpOptions = [
    { value: "maxmapid", name: "主线关卡" },
    { value: "tower", name: "通天塔" },
    { value: "dg", name: "一骑当千" },
    { value: "occu_1", name: "战士职业塔" },
    { value: "occu_2", name: "刺客职业塔" },
    { value: "occu_3", name: "射手职业塔" },
    { value: "occu_4", name: "法师职业塔" },
    { value: "rlevel", name: "角色等级" },
    { value: "vlevel", name: "VIP等级" },
    { value: "llevel", name: "军团等级" },
    { value: "yuanggu", name: "远古战场" },
    { value: "manor", name: "封地怪物" },
    { value: "lscore", name: "军团活跃度" },
    { value: "kh_td", name: "开黑转设备" },
    { value: "kh_tl", name: "开黑添加转移列表" },
    { value: "secrettrial", name: "天机试炼关卡" },
];
// 特殊礼包选项
const tmpGiftOptions = [
    // value = pid_元宝_vip经验
    { value: 'charge10000_100000_100000', name: '礼包金额-10000元' }
];
// 高级账号
const godOptions = [
    { value: "qwj", name: "全武将" },
    { value: "fjtx", name: "富甲天下" },
    { value: "gnjs", name: "功能解锁" },
    { value: "ycqk", name: "养成全开" },
    { value: "wjpj", name: "武将品阶到N,参数:0-6" },
    { value: "wjdj", name: "武将等级到N,参数:1-140" },
    { value: "mjrw", name: "主线任务跳关,不要填写没有的关卡" },

    // {value: "xiufu", name: "修复"},
];

exports.exec = async function (body, query, ctx) {

    const { uid, rname, rno, _id, servid, legion } = body;

    const banModel = await this.service.game.collection('bans');
    const ban = await banModel.findOne({ uid });
    let expired = ban ? ban.expired : 0;

    const style = { margin: 8 };
    const mute = await this.remote.agent_ismute({ uid, servid: +servid });
    const buttons = [
        ...this.business["king-role-rolebtns"]({
            rname: rname || rno, // 指定角色描述信息
            data: { rid: _id, uid, servid }, // 指定默认提交数据
            ban: {
                expired
            },
            mute: {
                unforbid: mute ? 1 : 0,
            }
        }, query, ctx),
        {
            _type: 'AkButton',
            children: '踢下线',
            style,
            type: 'danger',
            data: { rid: _id, uid, servid },
            action: 'king-role-kick',
            confirm: `确认把 ${rname || rno} 踢下线么?`
        },
    ];

    if (ctx.actionSet.has('king-role-spp-send')) {
        const sppackList = await this.db.mongo.sppack.getSppacks(1);
        buttons.push({
            _type: 'AkButton',
            style: style,
            children: '模拟充值',
            type: 'primary',
            data: { uid, rid: _id, rname, rno, servid },
            modal: {
                maskClosable: false,
                title: `向${rname || rno} 发礼包`,
                children: {
                    _type: 'AkForm',
                    cancelModal: false,
                    confirm: ctx.actionSet.has('king-role-spp-send') ? `确认发送礼包给[${rname || rno}]?` : `确认提交给[${rname || rno}]的礼包申请么?`,
                    action: ctx.actionSet.has('king-role-spp-send') ? 'king-role-spp-send' : 'king-role-spp-apply',
                    form: [
                        {
                            type: 'select',
                            name: '礼包',
                            showSearch: true,
                            key: 'pid',
                            options: sppackList,
                            style: { minWidth: '400px' }
                        },
                        {
                            key: 'reason',
                            name: '原因',
                            require: true,
                        }
                    ],

                }
            }
        });
    }

    const gisdAction = `king-role-gsid-send`;
    if (ctx.actionSet.has(gisdAction)) {
        buttons.push({
            _type: 'AkButton',
            children: '道具增减',
            type: 'primary',
            modal: {
                maskClosable: false,
                width: "30%",
                title: "除武将GSID不可减少外，其他GSID都可以增减",
                children: {
                    _type: "AkForm",
                    cancelModal: false,
                    form: [
                        { name: '角色名', key: 'rname', placeholder: body.rname, disabled: true },
                        { name: 'UID', key: 'uid', placeholder: body.uid, disabled: true },
                        { name: '短号', key: 'rno', placeholder: body.rno, disabled: true },
                        { name: '服务器ID', key: 'sid', placeholder: body.servid, disabled: true },
                        { name: "道具ID", key: 'gsid', type: "number", require: true, },
                        { name: "数量", key: 'count', type: "number", require: true, placeholder: "可正可负" },
                        { name: ctx.i18n("头像框过期时间"), key: 'time', _tooltip: ctx.i18n("增加头像框时传入过期时间,不传则读取配置时间"), style: { width: '100%' }, type: "date", showTime: true, placeholder: ctx.i18n("增加头像框时传入过期时间,不传则读取配置时间") }
                    ],
                    action: gisdAction,
                }
            }
        })
    }

    if (ctx.actionSet.has('king-role-jumpinto')) {
        const jOptions = [...jumpOptions];
        if (global.config.game.is_test) {
            jOptions.push({ value: "create", name: "创角时间" });
        }
        buttons.push({
            _type: 'AkButton',
            style: style,
            children: '跳关跳级',
            type: 'primary',
            modal: {
                maskClosable: false,
                title: `${rname || rno} 跳关跳级`,
                children: {
                    _type: 'AkForm',
                    action: 'king-role-jumpinto',
                    data: { type: "maxmapid", rid: _id, servid, legion, uid },
                    cancelModal: false,
                    form: [
                        {
                            type: 'select',
                            name: '类型',
                            showSearch: true,
                            key: 'type',
                            require: true,
                            options: jOptions,
                            style: { minWidth: '374px' },
                        },
                        {
                            key: 'value',
                            name: '数值',
                            require: true,
                        },
                    ],
                }
            }
        });
    }

    if (ctx.actionSet.has('king-role-spp-gift_charge')) {
        buttons.push({
            _type: 'AkButton',
            style: style,
            children: '购买特殊礼包',
            type: 'primary',
            modal: {
                maskClosable: false,
                title: `${rname || rno} 购买特殊礼包`,
                children: {
                    _type: 'AkForm',
                    action: 'king-role-spp-gift_charge',
                    confirm: ctx.actionSet.has('king-role-spp-gift_charge') ? `确认发送礼包给[${rname || rno}]?` : `确认提交给[${rname || rno}]的礼包申请么?`,
                    data: { type: "maxmapid", rid: _id, servid, uid },
                    cancelModal: false,
                    form: [
                        {
                            type: 'select',
                            name: '礼包ID',
                            showSearch: true,
                            key: 'pid',
                            require: true,
                            options: tmpGiftOptions,
                            style: { minWidth: '374px' },
                        },
                        {
                            type: 'text',
                            key: 'comment',
                            name: '备注',
                        }
                    ],
                }
            }
        });
    }

    if (ctx.actionSet.has('king-role-god')) {
        buttons.push({
            _type: 'AkButton',
            style: style,
            children: '高级角色',
            type: 'primary',
            modal: {
                maskClosable: false,
                title: `${rname || rno} 高级角色`,
                children: {
                    _type: 'AkForm',
                    action: 'king-role-god',
                    data: { type: "qwj", value: 0, rid: _id, servid, uid },
                    cancelModal: false,
                    form: [
                        {
                            type: 'select',
                            name: '类型',
                            key: 'type',
                            require: true,
                            options: godOptions,
                            style: { minWidth: '374px' },
                        },
                        {
                            type: "number",
                            key: 'value',
                            name: '参数',
                            placeholder: "修改选项,请重新填值！"
                        },
                    ],
                }
            }
        });
    }

    return {
        title: (rname || rno) + ' 操作',
        children: {
            _type: 'div',
            children: buttons
        }
    }
};
