exports.name = '礼包商品一览';
exports.type = 'N';
exports.view = true;
exports.exec = async function (body, query, ctx) {

    const createForm = (name) => ({
        children: name,
        type: 'primary',
        _type: 'AkButton',
        modal: {
            width: '60%',
            children: {
                _type: 'AkForm',
                action: 'king-sppack-createorupd',
                form: [
                    {
                        name: '礼包ID',
                        key: 'pid',
                        require: true,
                        maxLength: 10,
                        disabled: name === '编辑'
                    },
                    {
                        name: '礼包名',
                        key: 'pname'
                    },
                    {
                        name: '价格',
                        key: 'price',
                        type: 'number'
                    },
                    {
                        key: 'status',
                        name: '开放模拟',
                        style: {minWidth: 150},
                        type: 'select',
                        require: true,
                        options: ['允许', '不允许']
                    }
                ]
            }
        }
    });

    const columns = [
        {
            title: '礼包ID',
            dataIndex: 'pid'
        },
        {
            title: '礼包名',
            dataIndex: 'pname'
        },
        {
            title: '礼包价格',
            dataIndex: 'price'
        },
        {
            title: '是否允许模拟充值',
            dataIndex: 'status'
        }
    ];
    const buttons = [];
    if (ctx.actionSet.has('king-sppack-createorupd')) {
        columns.push({
            title: '操作',
            dataIndex: 'action',
            type: 'AkButton',
            props: createForm('编辑')
        });
        buttons.push(createForm('添新'))

        buttons.push({
            children: '导入',
            type: 'primary',
            _type: 'AkButton',
            modal: {
                width: '60%',
                children: {
                    _type: 'AkForm',
                    action: 'king-sppack-createorupd',
                    form: [
                        {
                            name: '表格',
                            key: 'items',
                            type: 'excel',
                            require: true
                        }
                    ]
                }
            }
        })
    }


    return [{
        _type: 'AkTable',
        rowKey: '_id',
        limit: 20,
        columns,
        buttons,
        download: true,
        action: 'king-sppack-list'
    }]
};

