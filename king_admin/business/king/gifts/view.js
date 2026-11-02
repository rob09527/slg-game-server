exports.name = '推荐礼包';
exports.type = 'I';
exports.inherit = 'role-view';
exports.backIcon = true; // 返回图标开启
exports.exec = async function (body, query, ctx) {

    const {serverid: servid, rid} = query;

    const columns = [
        {
            title: '服务ID',
            dataIndex: 'servid'
        },
        {
            title: '触发时间',
            type: 'text-date',
            dataIndex: 'create'
        },
        {
            title: '失效时间',
            type: 'text-date',
            dataIndex: 'expireAt'
        },
        {
            title: '购买时间',
            type: 'text-date',
            dataIndex: 'buyTime'
        },
        {
            title: '礼包类型',
            dataIndex: 'type',
        },
        {
            title: '礼包价位',
            dataIndex: 'price',
        },
        {
            title: '礼包内容',
            dataIndex: 'rewardStr'
        },
        {
            title: '操作',
            type: 'AkButton',
            dataIndex: 'action',
            props: {
                type: 'primary',
                children: '重新激活',
                confirm: '确定重新激活12小时吗?',
                // modal 弹框, action 单纯提交
                action: `king-gifts-active`,
                _: {
                    disabled: `this.props.rowData.isBuy !== 0`,
                }
            }
        }
    ];

    const filter = [
        {
            key: 'create',
            type: 'date',
            name: '触发时间',
            pickerType: 'RangePicker'
        }
    ];

    return [{
        _type: 'AkTable',
        rowKey: '_id',
        limit: 10,
        filter,
        columns,
        action:  'king-gifts-find?serverid='+servid+'&rid='+rid
    }]
};

