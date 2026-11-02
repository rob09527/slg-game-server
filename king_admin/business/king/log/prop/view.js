exports.name = '道具日志查看';
exports.view = true;
exports.type = 'N';
exports.exec = async function (body, query, ctx) {


    const columns = [
        {
            title: '服务器',
            dataIndex: 'servid'
        },
        {
            title: "UID",
            dataIndex: "uid",
            show : false
        },
        {
            title: 'RNO',
            dataIndex: 'rno'
        },
        {
            title: 'GSID',
            dataIndex: 'gsid',
        },
        {
            title: '动作',
            dataIndex: 'typeEm',
            type: 'html'
        },
        {
            title: '数量',
            dataIndex: 'count'
        },
        {
            title: '时间',
            dataIndex: 'create'
        },
        {
            title: '现有',
            dataIndex: 'curcount'
        },
        {
            title: '途径',
            dataIndex: 'frompath',
            type: "div",
            props: {
                _: {
                    _tooltip: `this.props.rowData.origin`
                }
            }
        },
        {
            title: '操作',
            dataIndex: 'action',
            type: 'AkButton',
            props: {
                children: '关系日志',
                modal: `king-log-near`
            }
        }
    ];
    const servers = await this.service.game.serversOptions(ctx.adminRole);



    const filter = [
        {
            key: 'serverid',
            name: '服务器',
            type: 'select',
            showSearch: true,
            style: {minWidth: 150},
            options: servers.__is_all__ ? ['ALL', ...servers] : servers
        },
        {
            key: 'search',
            placeholder: 'rno,rname搜索',
            name: '角色搜索',
        },
        {
            key: 'uid',
            placeholder: 'uid搜索,优先级高于角色搜索',
            name: 'UID',
        },
        {
            key: 'gsid',
            name: 'GSID',
            placeholder: '例:38005,38006'
        },
        {
            key: 'from',
            name: '途径',
            placeholder: '搜索时请输入原始途径名'
        },
        {
            key: 'date',
            type: 'date',
            name: '日期',
            pickerType: 'RangePicker'
        },
        {
            key: 'type',
            name: '动作',
            type: 'select',
            options: [
                {
                    value: 'ALL',
                    name: '任何'
                },
                {
                    value: 'ADD',
                    name: '添加'
                },
                {
                    value: 'CST',
                    name: '消耗'
                }
            ]
        }
    ];

    const buttons = [];

    return [{
        _type: 'AkTable',
        rowKey: 'idx',
        size: 'small',
        download: true,
        limit: 20,
        filter,
        columns,
        buttons,
        action: `king-log-prop-find`
    }]
};

