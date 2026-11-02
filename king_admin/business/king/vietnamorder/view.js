exports.name = '越南订单查询';
exports.view = true;
exports.type = 'N';
exports.exec = async function (body, query, ctx) {
    let servers = await this.service.game.serversOptions(ctx.adminRole);
    servers = ["ALL", ...servers];

    const columns = [
        {
            title: '服务器',
            dataIndex: 'serverid',
            sorter: true,
        },
        {
            title: 'UID',
            dataIndex: 'uid'
        },
        {
            title: '越南方订单号',
            dataIndex: 'tranid'
        },
        {
            title: '商品ID',
            dataIndex: 'packageid'
        },
        {
            title: '价格',
            dataIndex: 'price',
            sorter: true,
        },
        {
            title: '礼包内容',
            dataIndex: 'items',
        },

        {
            title: '状态',
            dataIndex: 'state'
        },
        {
            title: '创建时间',
            dataIndex: 'create',
            sorter: true,
            type: 'text-date'
        }
    ];

    if (ctx.actionSet.has('king-vietnamorder-reissue')) {
        columns.push({
            title: '操作',
            type: 'AkButton',
            dataIndex: 'action',
            props: {
                type: 'primary',
                children: '补单',
                confirm: '确定补单吗?',
                action: `king-vietnamorder-reissue`,
                _: {
                    disabled: `this.props.rowData.state == '成功执行'`,
                },
                // modal 弹框, action 单纯提交

            }
        })
    }


    const filter = [
        {
            key: 'tranid',
            name: '越南方订单号',
            _tooltip: '设置订单号其他条件无效',
            repel: true // 设置与其他所以条件互斥,设置与指定key 互斥可以用 数组
        },
        {
            key: 'serverid',
            name: '服务器',
            type: 'select',
            showSearch: true,
            style: { minWidth: 180 },
            options: servers
        },
        {
            key: 'uid',
            name: 'UID',
        },
        {
            key: 'packageid',
            name: '商品ID'
        },
        {
            key: 'state',
            name: '订单状态',
            type: 'select',
            style: { minWidth: 180 },
            options: ['ALL', { name: '成功', value: 1 }, { name: '等待', value: 2 }]
        },
        {
            key: 'create',
            type: 'date',
            name: '创建时间',
            pickerType: 'RangePicker'
        }
    ];

    return [
        {
            _type: 'AkTable',
            rowKey: 'id',
            columns,
            limit: 10,
            download: true,
            filter,
            action: `king-vietnamorder-find`
        }
    ]
};

