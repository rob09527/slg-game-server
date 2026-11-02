exports.name = '越南礼包码列表';
exports.view = true;
exports.type = 'N';
exports.exec = function (body, query, ctx) {
    const columns = [
        {
            title: '礼包id',
            dataIndex: 'packageid'
        },
        {
            title: '价格',
            dataIndex: 'price'
        },
        {
            title: '礼包数据',
            dataIndex: 'items'
        },
        {
            title: '说明',
            dataIndex: 'chineseitems'
        },
        {
            title: '状态',
            dataIndex: 'state'
        },
        {
            title: '创建时间',
            dataIndex: 'create',
            type: "text-date"
        },
        {
            title: '操作',
            dataIndex: 'action',
            type: 'AkButton',
            props: {
                children: '修改',
                disabled: !ctx.actionSet.has('king-vietnamgift-edit'),
                modal: 'king-vietnamgift-editmodal'
            }
        }

    ];

    const filter = [
        {
            key: 'packageid',
            name: '礼包码id'
        },
        {
            key: 'state',
            name: '订单状态',
            type: 'select',
            style: { minWidth: 180 },
            options: ['ALL', { name: '待审核', value: 1 }, { name: '通过', value: 2 }, { name: '驳回', value: 3 }, { name: '下架', value: 4 }]
        },

    ];
    return [
        {
            _type: 'AkTable',
            rowKey: 'id',
            filter,
            columns,
            size: 'small',
            limit: 50,
            action: 'king-vietnamgift-find'
        }
    ]
};

