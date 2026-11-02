exports.name = '战斗数据';
exports.view = true;
exports.type = 'N';
exports.exec = async function (body, query, ctx) {

    const columns = [
        {
            title: '录像ID',
            dataIndex: '_id'
        },
        {
            title: '用户',
            dataIndex: 'rname',
        },
        {
            title: '区服',
            dataIndex: 'servid'
        },
        {
            title: '类型',
            dataIndex: 'type'
        },
        {
            title: '结果',
            dataIndex: 'ret'
        },
        {
            title: '操作',
            dataIndex: 'action',
            type: 'AkButton',
            props: {
                type: 'switch',
                children: '复制战斗数据',
                _ : {
                    onClick: `()=>{
                            var textarea = document.createElement("textarea"); //创建input对象
                            textarea.id = 'cp-em-cp'   
                            var currentFocus = document.activeElement; //当前获得焦点的元素
                            var toolBoxwrap = document.getElementById('NewsToolBox'); //将文本框插入到NewsToolBox这个之后
                            document.body.appendChild(textarea); //添加元素
                            textarea.value = JSON.stringify(this.props.rowData);
                            textarea.focus();
                            if (textarea.setSelectionRange) {
                                textarea.setSelectionRange(0, textarea.value.length); //获取光标起始位置到结束位置
                            } else {
                                textarea.select();
                            }
                            try {
                                var flag = document.execCommand("copy"); //执行复制
                            } catch (eo) {
                                var flag = false;
                            }
                            document.body.removeChild(textarea); //删除元素
                            currentFocus.focus();
                            Antd.message.success('复制成功')
                    
                    }`
                }
            }
        },
        {
            title: '创建时间',
            dataIndex: 'create',
            sorter: true,
            type: 'text-date'
        }
    ];

    const filter = [
        {
            key: '_id',
            name: '录像ID',
        },
        {
            key: 'rname',
            name: '用户昵称或rno或uid',
        },
        {
            key: 'type',
            name: '战斗类型',
            type: 'select',
            style: {minWidth: 80},
            options: ['PVP', 'NORMAL']
        }
    ];

    return [
        {

            _type: 'AkTable',
            rowKey: '_id',
            columns,
            limit: 5,
            filter,
            action: 'king-battle-find'
        }
    ]
};

