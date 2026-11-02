exports.name = '渠道设置列表';
exports.view = true;
exports.type = 'N';
exports.exec = async function (body, query, ctx) {

    const createBtn = {
        children: '添加',
        type: 'primary',
        modal: {
            width: "70%",
            children: {
                _type: "AkForm",
                form: [
                    {name: 'gameid', type: "textarea", key: 'gameid'},
                    {name: 'name', type: "textarea", key: 'name'},
                    {name: 'appkey', type: "textarea", key: 'appkey'},
                    {name: 'appsecret', type: "textarea", key: 'appsecret'},
                    {name: 'h5数据上报地址', type: "textarea", key: 'url'},
                ],
                action: 'king-channel-create'
            }
        },
    }

    const columns = [
        {
            title: 'gameid',
            dataIndex: 'gameid'
        },
        {
            title: 'name',
            dataIndex: 'name'
        },
        {
            title: 'appkey',
            dataIndex: 'appkey'
        },
        {
            title: 'appsecret',
            dataIndex: 'appsecret',
        },
        {
            title: 'h5数据上报地址',
            dataIndex: 'url',
        },
        {
            title: '操作',
            dataIndex: 'action',
            type: 'components',
            components: [
                {
                    _type: 'AkButton',
                    ...createBtn,
                    children: '编辑',
                },
            ]
        },
    ];


    // const proxyConfig = this.proxyConfig;
    const filter = [
        {
            key: 'gameid',
            name: "gameid",
            style: {minWidth: 120},
        }
    ];

    return [
        {
            _type: 'AkTable',
            rowKey: '_id',
            filter,
            columns,
            size: 'small',
            limit: 50,
            buttons: [createBtn],
            action: 'king-channel-find'
        }
    ]
};

