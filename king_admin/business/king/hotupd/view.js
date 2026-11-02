exports.name = '热更资源列表';
exports.view = true;
exports.type = 'N';
exports.exec = async function (body, query, ctx) {

    const columns = [
        {
            title: '版本',
            dataIndex: 'version'
        },
        {
            title: '平台',
            dataIndex: 'platform'
        },
        {
            title: '地址',
            dataIndex: 'url'
        },
        {
            title: '状态',
            dataIndex: 'status_str',
        },
        {
            title: '创建时间',
            dataIndex: 'create',
            type: "text-date"
        },
        {
            title: '操作',
            dataIndex: 'action',
            type: 'components',
            components: [
                {
                    _type: 'AkButton',
                    children: '发布测试',
                    action: `king-hotupd-edit?status=1`,
                    confirm: "确认发布测试么?"
                },
                {
                    _type: 'AkButton',
                    children: '发布上线',
                    action: `king-hotupd-edit?status=2`,
                    confirm: "确认发布生产环境么?"
                },
                {
                    _type: 'AkButton',
                    type: 'danger',
                    children: '删除',
                    action: `king-hotupd-remove`,
                    confirm: "确定未启用么?",
                    _: {
                        disabled: 'this.props.rowData.status !== 0'
                    }
                },
            ]
        }
    ];


    // const proxyConfig = this.proxyConfig;
    const filter = [
        {
            key: 'platform',
            name: "设备",
            style: { minWidth: 120 },
        }
    ];
    const buttons = [];

    const hotupds = await this.service.game.collection('hotupds');
    const whitteObj = await hotupds.findOne({ status: -1 });
    buttons.push({
        children: '编辑白名单',
        type: 'primary',
        modal: {
            title: "编辑白名单",
            width: "70%",
            children: {
                _type: "AkForm",
                data: {
                    whitelist_str: whitteObj && Object.keys(whitteObj.whitelist).join(',')
                },
                form: [
                    { name: '白名单', type: "textarea", key: 'whitelist_str', placeholder: '多个使用英文","分割' },
                ],
                action: 'king-hotupd-edit'
            }
        },
    });

    if (ctx.actionSet.has('king-servers-auto_open')) {
        const setting = await this.remote.proxy_get_global();
        buttons.push({
            children: '设置登录跳转',
            type: 'primary',
            modal: {
                title: "编辑登录跳转",
                width: "70%",
                children: {
                    _type: "AkForm",
                    data: {
                        type_url: setting.type_url ? setting.type_url : 1,
                        new_url: setting.new_url ? setting.new_url : "",
                    },
                    form: [
                        {
                            key: 'type_url',
                            name: '跳转类型',
                            type: 'select',
                            style: { minWidth: 180 },
                            options: [{ name: '不跳转', value: 1 }, { name: '审核服跳转', value: 2 }, { name: '正式服跳转', value: 3 }]
                        },
                        { name: '新登录地址', type: "textarea", key: 'new_url' },
                    ],
                    action: 'king-servers-auto_open'
                }
            },
        });
    }
    return [
        {
            _type: 'AkTable',
            rowKey: 'id',
            filter,
            columns,
            size: 'small',
            limit: 50,
            buttons: buttons,
            action: 'king-hotupd-find'
        }
    ]
};

