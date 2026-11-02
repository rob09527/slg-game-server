exports.name = '角色武将列表';
exports.view = true;
exports.type = 'N';
exports.exec = function (body, query, ctx) {

    const columns = [
        {
            title: 'UID',
            dataIndex: 'uid'
        },
        {
            title: 'RNO',
            dataIndex: "rno"
        },
        {
            title: '昵称',
            dataIndex: "rname"
        },
        {
            title: '武将ID',
            dataIndex: "gsid"
        },
        {
            title: '武将等级',
            dataIndex: "level"
        }, 
        {
            title: '武将品阶',
            dataIndex: "class"
        }, 
        {
            title: '武将创建时间',
            dataIndex: 'create',
            type: 'text-date',
            sorter: true
        },
        {
            title: '操作',
            dataIndex: 'action',
            type: 'components',
            components: [
                {
                    _type: 'AkButton',
                    type: 'danger',
                    children: '删除',
                    confirm: '确认删除该武将么?',
                    action: 'king-general-delete'
                }
            ]
        }        
    ];

    const filter = [
        {
            key: 'rno',
            placeholder: '必须填写',
            name: '角色RNO',
        },
        {
            key: 'gsid',
            placeholder: '选择填写',
            name: '武将GSID',
        },
    ];

    return [
        {
            _type: 'AkTable',
            rowKey: '_id',
            filter,
            columns,
            size: 'small',
            limit: 50,
            buttons:[],
            action: 'king-general-find'
        }
    ]
};

