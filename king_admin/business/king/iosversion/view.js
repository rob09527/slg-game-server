exports.name = 'IOS审核列表';
exports.view = true;
exports.type = 'N';
exports.exec = async function (body, query, ctx) {

    const columns = [
        {
            title: '平台ID',
            dataIndex: 'gameid'
        },
        {
            title: '版本',
            dataIndex: 'version'
        },
        {
            title: '状态',
            dataIndex: 'status_str',
        },
        {
            title: '操作',
            dataIndex: 'action',
            type: 'components',
            components: [
                {
                    _type: 'AkButton',
                    children: '启用',
                    action: `king-iosversion-edit?status=1`,
                    confirm: "确认启用么?"
                },
                {
                    _type: 'AkButton',
                    children: '停用',
                    action: `king-iosversion-edit?status=0`,
                    confirm: "确认停用么?"
                },
                {
                    _type: 'AkButton',
                    type: 'danger',
                    children: '删除',
                    action: `king-iosversion-edit?status=2`,
                    confirm: "确认删除么?",
                    _: {
                        disabled: 'this.props.rowData.status === 1'
                    }
                },
            ]
        }
    ];


    // const proxyConfig = this.proxyConfig;
    const filter = [

        {
            key: 'gameid',
            name: "平台ID",
            style: {minWidth: 120},
        }
    ];

    const button = {
        children: '添加',
        type: 'primary',
        modal: {
            title: "添加",
            width: "70%",
            children: {
                _type: "AkForm",
                data: {
                    gameid:"",
                    version:"",
                    status:"0"
                },
                form: [
                    {name: '平台ID', type: "textarea", key: 'gameid'},
                    {name: '版本', type: "textarea", key: 'version'},
                ],
                action: 'king-iosversion-edit'
            }
        },
    }

    return [
        {
            _type: 'AkTable',
            rowKey: 'id',
            filter,
            columns,
            size: 'small',
            limit: 50,
            buttons: [button],
            action: 'king-iosversion-find'
        }
    ]
};

