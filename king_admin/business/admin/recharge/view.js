exports.name = '模拟充值记录';
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
        },
        {
            title: "礼包ID",
            dataIndex: "spppid",
        },
        {
            title: "管理员",
            dataIndex: "adminName",
        },
        {
            title: "原因",
            dataIndex: "reason",
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
            action: 'admin-recharge-find'
        }
    ]
};

