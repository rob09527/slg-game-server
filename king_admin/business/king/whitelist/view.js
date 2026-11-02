exports.name = '白名单列表';
exports.view = true;
exports.type = 'N';
exports.exec = function (body, query, ctx) {

    const columns = [
        {
            title: 'UID or IP',
            dataIndex: 'uid'
        },
        {
            title: '创建时间',
            dataIndex: 'create',
            type: "text-date"
        },
        {
            title: '操作',
            dataIndex: 'action',
            type: 'AkButton',
            props: {
                children: '删除',
                confirm: '确认删除该白名单么?',
                action: 'king-whitelist-edit?del=1'
            }
        }
    ];

    const buttons = [];
    if (ctx.actionSet.has('king-whitelist-edit')) {
        buttons.push({
            _type: 'AkButton',
            children: '添加白名单',
            modal: {
                children: {
                    _type: 'AkForm',
                    form: [
                        {
                            key: 'uid',
                            name: 'UID or IP',
                            require: true
                        }
                    ],
                    action: 'king-whitelist-edit',
                    confirm: '请确认您的操作?'
                },

            }
        })
    }

    // const proxyConfig = this.proxyConfig;

    return [
        {
            _type: 'AkTable',
            rowKey: 'id',
            buttons,
            columns,
            size: 'small',
            limit: 50,
            action: 'king-whitelist-find'
        }
    ]
};

