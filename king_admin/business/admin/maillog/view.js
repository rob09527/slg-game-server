exports.name = '邮件发送记录';
exports.view = true;
exports.type = 'N';
exports.exec = function (body, query, ctx) {
    const columns = [
        {
            title: '服务器',
            dataIndex: 'servid',
            sorter: true,
        },
        {
            title: 'UID',
            dataIndex: 'uid'
        },
        {
            title: "昵称",
            dataIndex: "rname",
            type: 'div',
            props: {
                _: {
                    _tooltip: 'this.props.rowData.roles'
                }
            }

        },
        {
            title: "标题",
            dataIndex: "title",
        },
        {
            title: "内容",
            dataIndex: "content",
        },
        {
            title: "奖励",
            dataIndex: "reward",
        },
        {
            title: "管理员",
            dataIndex: "adminName",
        },
        {
            title: '创建时间',
            dataIndex: 'create_at',
            sorter: true,
        },
    ];

    // const filter = [
    //     {
    //         key: 'uid',
    //         name: 'UID',
    //     },
    //    {
    //         key: "rname",
    //         name: "昵称",
    //    }
    // ];

    return [
        {
            _type: 'AkTable',
            rowKey: 'id',
            columns,
            limit: 10,
            download: true,
            size: "small",
            // filter,
            action: 'admin-maillog-find'
        }
    ]
};

