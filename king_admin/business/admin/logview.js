exports.name = '日志查看';
exports.view = true;
exports.type = 'N';
exports.exec = function (body, query, ctx) {

    const columns = [
        {
            title: '时间',
            dataIndex: 'create_at',
            type: 'text-date'
        },
        {
            title: '管理员',
            dataIndex: 'adminName',
        },
        {
            title: '操作业务',
            dataIndex: 'actionName',
            type: 'div',
            _valueKey : 'children',
            props: {
                _: {
                    _tooltip: `JSON.stringify(this.props.rowData.body, null ,4)`,
                }
            }
        },
        {
            title: 'IP',
            dataIndex: 'ip'
        },
        {
            title: 'body',
            dataIndex: 'body',
            show: false
        }
    ];

    const filter = [
        {
            key: 'adminName',
            name: '管理员'
        },
        {
            key: 'actionName',
            name: '业务名',
            placeholder: '业务名或ID'
        },
        {
            key: 'where',
            name: '拓展条件',
            placeholder: 'a.c=111'
        },
        {
            key: 'create',
            name: '时间',
            type: 'date',
            pickerType: 'RangePicker',
            showTime: true
        }
    ];

    return [
        {

            _type: 'AkTable',
            rowKey: '_id',
            limit: 10,
            filter,
            columns,
            download: true,
            action: 'admin-logview-list'
        }
    ]
};

