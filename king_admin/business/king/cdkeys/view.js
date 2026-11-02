exports.name = '礼包码管理';
exports.view = true;
exports.type = 'N';
const kmodal = function (ctx, channels, bundles, serverOptions, action, confirm) {
    const edit = action.endsWith("edit")
    const multi = action.endsWith("multi")
    const data = {
        children: {
            _type: 'AkForm',
            cancelModal: false,
            action: 'king' + action,
            form: [
                edit ? {
                    name: 'KEY',
                    key: 'key',
                    require: true
                } : null,
                {
                    name: '礼包名',
                    key: 'name',
                    require: true
                },
                {
                    key: 'channels',
                    name: '渠道',
                    type: 'select',
                    placeholder: '可多选，不选默认全渠道',
                    style: {width: '100%'},
                    options: channels.map(c => c.name),
                    mode: "multiple"
                },
                {
                    key: 'servids',
                    name: '定向服务',
                    type: 'select',
                    placeholder: '可多选，不选默认全服',
                    style: {width: '100%'},
                    showSearch: true,
                    mode: "multiple",
                    options: [
                        {name: 'ALL', value: 'ALL'},
                        ...serverOptions,
                    ]
                },
                {
                    key: 'bundles',
                    name: '包名',
                    type: 'select',
                    placeholder: '可多选，不选则不限制',
                    style: {width: '100%'},
                    options: bundles,
                    mode: "multiple"
                },
                {
                    key: 'start',
                    name: '开始时间',
                    type: 'date',
                    showTime: true
                },
                {
                    key: 'end',
                    name: '结束时间',
                    type: 'date',
                    showTime: true
                },
                {
                    key: 'limit',
                    name: '单角色次数',
                    type: 'number',
                    placeholder: '可不输入,默认1',
                },
                {
                    key: 'remain',
                    name: '单码使用次数',
                    type: 'number',
                    placeholder: '可不输入,默认 1, -1表示无限次',
                },
                edit || multi ? null : {
                    key: 'count',
                    name: '生成次数',
                    type: 'number',
                    require: true
                },
                {
                    key: 'level',
                    name: '可用最低等级',
                    type: 'number',
                    placeholder: '可不输入',
                },
                {
                    name: '奖励道具',
                    key: 'rewardStr',
                    placeholder: '例如: 38005*100,38006*10000',
                    require: util.rewardRequire(false)
                }
            ].filter(Boolean)
        }
    }
    if (confirm) data.children.confirm = confirm;
    return data;
}

exports.exec = async function (body, query, ctx) {

    const serverOptions =  await this.service.game.serversOptions(ctx.adminRole);

    const channels = await this.db.mongo.bundle.getChannel();
    const bundles = await this.db.mongo.bundle.getBundles(ctx.adminRole);

    const columns = [
        {
            title: '礼包名称',
            dataIndex: 'name',
            type: 'div',
            props: {
                _: {
                    children: `this.props.rowData.name`,
                    _tooltip: `this.props.rowData.rewardStr`
                }
            }
        },
        {
            title: 'KEY',
            dataIndex: 'key'
        },
        {
            title: '可兑换次数',
            dataIndex: 'limit',
            sorter: true
        },
        {
            title: '剩余次数',
            dataIndex: 'remain',
            sorter: true
        },
        {
            title: '定向渠道',
            dataIndex: 'channel_str'
        },
        {
            title: '定向服务器',
            dataIndex: 'servid_str'
        },
        {
            title: '定向包名',
            dataIndex: 'bundles_str',
            width: '35%'
        },
        {
            title: '可用等级',
            dataIndex: 'level'
        },
        {
            title: '时间区间',
            children: [
                {title: '开始', dataIndex: 'start'},
                {title: '结束', dataIndex: 'end'}
            ]
        },
        {
            title: '状态',
            dataIndex: 'status',
            type: 'AkInput',
            action: 'king-cdkeys-pause',
            props: {
                type: 'switch',
                confirm: '确认修改该礼包码的状态么?'
            }
        },
        {
            title: '创建时间',
            dataIndex: 'create',
            sorter: true,
            type: 'text-date'
        },
        {
            title: '操作',
            dataIndex: 'action',
            type: 'components',
            components: [
                {
                    _type: 'AkButton',
                    children: '编辑',
                    modal: kmodal(ctx, channels, bundles, serverOptions, '-cdkeys-edit')
                },
                {
                    _type: 'AkButton',
                    children: '删除',
                    type: 'danger',
                    action: 'king-cdkeys-delete',
                    confirm: '确认删除吗？'
                }
            ]
        },
    ];

    const filter = [
        {
            key: 'channel',
            name: '渠道',
        },
        {
            key: 'servid',
            name: '定向服务',
            type: 'select',
            showSearch: true,
            options: [
                {name: 'ALL', value: 'ALL'},
                ...serverOptions,
            ]
        },
        {
            key: 'kname',
            name: '礼包名称',
        },
        {
            key: 'key',
            name: 'KEY',
        },
        {
            key: 'create',
            type: 'date',
            name: '创建日期',
            pickerType: 'RangePicker',
            showTime: true
        }
    ];
    const buttons = [
        {
            children: '创建礼包码',
            type: "primary",
            modal: kmodal(ctx, channels, bundles, serverOptions, '-cdkeys-create')
        },
        {
            children: '批量修改',
            modal: kmodal(ctx, channels, bundles, serverOptions, '-cdkeys-multi', '会修改所有同名礼包码，确认吗？')
        },
        {
            children: '批量删除',
            type: "danger",
            modal: {
                children: {
                    _type: 'AkForm',
                    cancelModal: false,
                    action: 'king-cdkeys-multi?del=1',
                    confirm: '会删除所有同名礼包码，确认吗？',
                    form: [
                        {
                            name: '礼包名',
                            key: 'name',
                            require: true
                        },
                    ]
                }
            }
        }
    ];

    return [
        {

            _type: 'AkTable',
            rowKey: 'id',
            columns,
            limit: 10,
            buttons,
            download: true,
            filter,
            action: 'king-cdkeys-find'
        }
    ]
};

