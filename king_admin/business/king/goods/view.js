exports.name = 'H5商品设置列表';
exports.view = true;
exports.type = 'N';
exports.exec = async function (body, query, ctx) {

    const createBtn = {
        children: '添加',
        type: 'primary',
        modal: {
            width: "70%",
            children: {
                _type: "AkForm",
                form: [
                    {name: '商品id', type: "textarea", key: 'id'},
                    {name: '游戏pid', type: "textarea", key: 'pid'},
                    {name: '商品名价格', type: "textarea", key: 'price'},
                    {name: '商品名', type: "textarea", key: 'name'},
                ],
                action: 'king-goods-create'
            }
        },
    }



    const columns = [
        {
            title: '商品id',
            dataIndex: 'id'
        },
        {
            title: '游戏pid',
            dataIndex: 'pid'
        },
        {
            title: '商品名价格',
            dataIndex: 'price'
        },
        {
            title: '商品名',
            dataIndex: 'name'
        },        
        {
            title: '操作',
            dataIndex: 'action',
            type: 'components',
            components: [
                {
                    _type: 'AkButton',
                    ...createBtn,
                    children: '编辑',
                },
                {
                    _type: 'AkButton',
                    children: '删除',
                    type: 'danger',
                    action: 'king-goods-create?del=1',
                    confirm: `确认删除该商品么?`
                }
            ]
        },
    ];

    const btns = [
        {
            children: '导出到配置',
            type: 'danger',
            confirm: "确认导出?",
            action: 'king-goods-save'
        },      
        {
            children: '从配置导入',
            type: 'primary',
            confirm: "确认导入?",
            action: 'king-goods-load'
        },
        createBtn,
    ]


    const filter = [
        {
            key: 'id',
            name: "id",
            style: {minWidth: 120},
        },
        {
            key: 'pid',
            name: "pid",
            style: {minWidth: 120},
        }
    ];



    return [
        {
            _type: 'AkTable',
            rowKey: '_id',
            filter,
            columns,
            size: 'small',
            limit: 50,
            buttons: btns,
            action: 'king-goods-find'
        }
    ]
};

