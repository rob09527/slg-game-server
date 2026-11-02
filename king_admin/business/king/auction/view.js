exports.name = '拍卖管理';
exports.view = true;
exports.type = 'N';
exports.exec = async function (body, query, ctx) {

    const servers = await this.service.game.serversOptions(ctx.adminRole);


    let columns = [
        {
            title: '拍卖方/拍者',
            dataIndex: 'auctioneer_info',
        },
        {
            title: '拍卖商品',
            dataIndex: 'item_str'
        },
        {
            title: '基础价',
            dataIndex: 'basePrice'
        },
        {
            title: '起拍价',
            dataIndex: 'firstAuction'
        },
        {
            title: '一口价',
            dataIndex: 'price'
        },
        {
            title: '竞价',
            dataIndex: 'auctionPrice'
        },
        {
            title: '创拍时间',
            dataIndex: 'create',
            type: 'text-date'
        },{
            title: '状态',
            dataIndex: 'status_str'
        }
    ];
    if (body._export_){ // 如果是导出
        columns = [
            {
                title: '拍卖方/拍者',
                dataIndex: 'auctioneer_info',
            },
            {
                title: '拍品ID',
                dataIndex: 'gid'
            },
            {
                title: '拍卖商品',
                dataIndex: 'item_str'
            },
            {
                title: '基础价',
                dataIndex: 'basePrice'
            },
            {
                title: '起拍价',
                dataIndex: 'firstAuction'
            },
            {
                title: '商品一口价',
                dataIndex: 'price'
            },
            {
                title: '商品成交价格',
                dataIndex: 'sellPrice'
            },
            {
                title: '商品服务器或玩家服务器',
                dataIndex: 'servid'
            },
            {
                title: '创拍时间',
                dataIndex: 'create',
                type: 'text-date'
            },{
                title: '拍品状态',
                dataIndex: 'status_str'
            },
            {
                title: '玩家昵称',
                dataIndex: 'rname'
            },
            {
                title: '玩家UID',
                dataIndex: 'uid'
            },
            {
                title: '玩家短号',
                dataIndex: 'rno'
            },
            {
                title: '玩家VIP',
                dataIndex: 'vip'
            },
            {
                title: '玩家出价',
                dataIndex: 'auctionPrice'
            },
            {
                title: '出价时间',
                dataIndex: 'auc_create',
                type: 'text-date'
            }
        ]
    }
    const filter = [
        {
            key: 'servid',
            name: '服务器',
            showSearch: true,
            type: 'select',
            style: {minWidth: 150},
            options: [  {value: 'ALL',name: 'ALL'}, ...servers]
        },
        {
            key: 'auctioneer_info',
            name: '拍卖方'
        },
        {
            key: 'create',
            name: '建拍时间',
            type: 'date',
            pickerType: 'RangePicker'
        },
        {
            key: 'status',
            name: '状态',
            type: 'select',
            options: [
                {
                    value: 'ALL',
                    name: 'ALL'
                },
                {
                    value: '0',
                    name: '拍卖中'
                },
                {
                    value: 1,
                    name: '已卖出'
                },
                {
                    value: 2,
                    name: '流拍'
                }
            ]
        }
    ];


    return [
        {

            _type: 'AkTable',
            rowKey: '_id',
            columns,
            limit: 10,
            filter,
            download: true,
            action:   'king-auction-find'
        }
    ]
};

