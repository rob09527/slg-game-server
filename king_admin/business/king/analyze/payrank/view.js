exports.name = '付费排行';
exports.type = 'N';

exports.exec = async function (body, query, ctx) {

    const servers = await this.service.game.serversOptions(ctx.adminRole);
    // const bundles = await this.db.mongo.bundle.getBundles(ctx.adminRole);

    const filter = [
        {
            key: 'servid',
            name: '服务器',
            type: 'select',
            showSearch: true,
            style: {minWidth: 180},
            options: ['ALL', ...servers]
        },
        {
            key: 'create',
            type: 'date',
            name: '下单日期',
            pickerType: 'RangePicker'
        }
    ];

    const columns = [
        {
            title: '区服',
            dataIndex: 'servid',
        },
        {
            title: '角色名',
            dataIndex: 'rname',
            type: "html"
        },
        {
            title: 'UID',
            dataIndex: 'uid',
        },
        {
            title: '金额',
            dataIndex: 'price'
        },
        {
            title: '注册时间',
            dataIndex: 'role_create',
            type: 'text-date'
        },
        {
            title: '最后登录时间',
            dataIndex: 'last_login',
            type: 'text-date'
        },
        {
            title: '最后下单时间',
            dataIndex: 'last_order',
            type: 'text-date'
        }
    ];
    //

    return [{
        _type: 'AkTable',
        filter,
        filter_history: true,
        size: 'small',
        limit: 15,
        download: true,
        columns,
        action: 'king-analyze-payrank-list'
    }]
};

