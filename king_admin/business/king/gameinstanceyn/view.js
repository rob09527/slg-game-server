exports.name = '越南实例查看';
exports.view = true;
exports.type = 'N';
exports.exec = async function (body, query, ctx) {
    const columns = [
        {
            title: '服务器地址',
            dataIndex: 'host'
        },
        {
            title: '端口',
            dataIndex: 'port'
        },
        {
            title: '内网地址',
            dataIndex: 'ip'
        },
        {
            title: 'CPU',
            dataIndex: 'cpu'
        },
        {
            title: '内存',
            dataIndex: 'mem'
        },
        {
            title: '在线人数',
            dataIndex: 'online_count'
        }
    ];


    const buttons = [];


    return {
        _type: 'SocketContainer',

        children: [{
            _type: 'AkTable',
            rowKey: 'id',
            size: 'small',
            buttons,
            limit: 50,
            columns,
            action: `king-gameinstanceyn-list`
        }]
    }
};

