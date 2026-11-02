exports.name = '订单查询';
exports.view = true;
exports.type = 'N';
exports.exec = async function (body, query, ctx) {
    let servers = await this.service.game.serversOptions(ctx.adminRole);
    servers = ["ALL", ...servers];
    const bundles = await this.db.mongo.bundle.getBundles(ctx.adminRole);

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
            title: '当时等级',
            dataIndex: 'current_level'
        },
        {
            title: '订单号',
            dataIndex: 'oid'
        },
        {
            title: '商品ID',
            dataIndex: 'pid'
        },
        {
            title: '价格',
            dataIndex: 'price',
            sorter: true,
        },
        {
            title: '是否代金券',
            dataIndex: 'coupon',
        },

        {
            title: '包名',
            dataIndex: 'bundle'
        },
        {
            title: '平台',
            dataIndex: 'platform'
        },
        {
            title: '第三方订单ID',
            dataIndex: 'transactionid'
        },
        {
            title: '创建时间',
            dataIndex: 'create',
            sorter: true,
            type: 'text-date'
        },
        {
            title: '确认时间',
            dataIndex: 'confirm',
            sorter: true,
            type: 'text-date'
        },
        {
            title: '发货时间',
            dataIndex: 'deliver',
            sorter: true,
            type: 'text-date'
        }

    ];
    if (ctx.actionSet.has('king-order-reissue')) {
        columns.push({
            title: '操作',
            type: 'AkButton',
            dataIndex: 'action',
            props: {
                type: 'primary',
                children: '补单',
                confirm: '确定补单吗?',
                action: `king-order-reissue`,
                _: {
                    disabled: `!(this.props.rowData.confirm > 0 && !(this.props.rowData.deliver > 0))`,
                },
                // modal 弹框, action 单纯提交

            }
        })
    }
    // if (this.channel_group === 'junshi') {
    //     columns.splice(5, 0, {
    //         title: '是否超玩会',
    //         dataIndex: 'cwh',
    //     },)
    // }
    const filter = [
        {
            key: 'oid',
            name: '订单号',
            _tooltip: '设置订单号其他条件无效',
            repel: true // 设置与其他所以条件互斥,设置与指定key 互斥可以用 数组
        },
        {
            key: 'serverid',
            name: '服务器',
            type: 'select',
            showSearch: true,
            style: {minWidth: 180},
            options: servers
        },
        {
            key: 'uid',
            name: 'UID',
        },
        {
            key: 'pid',
            name: '商品ID'
        },
        {
            key: 'bundle',
            name: '包名',
            type: 'select',
            mode: "multiple",
            style: {minWidth: 230},
            options: [...bundles]
        },
        {
            key: 'type',
            name: '订单类型',
            type: 'select',
            style: {minWidth: 180},
            options: ['ALL', {name: '非代金券订单', value: 1}, {name: '代金券订单', value: 2}]
        },
        {
            key: 'create',
            type: 'date',
            name: '创建时间',
            pickerType: 'RangePicker'
        },
        {
            key: 'today',
            type: 'switch',
            name: '首充日',
            _tooltip: '条件当日为玩家第一次充值，设置条件 创建时间时有效'
        },
        {
            key: 'ignore',
            type: 'switch',
            name: '忽略无效订单',
            _tooltip: '未付款订单为无效订单'
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
            action: `king-order-find`
        }
    ]
};

