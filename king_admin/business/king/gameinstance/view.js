exports.name = '实例管理';
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

    const onAction = (action, data) => {
        if (action !== 'INSTANCE_CHANGE') return;
        const {host, port, ...params} = data;
        const table = this.sibling['gameinstance-table'];
        for (const item of table.state.dataSource) {
            if (host === item.host && port === item.port) {
                Object.assign(item, params);
                break;
            }
        }
        table.setState({dataSource: [...table.state.dataSource]})
    }

    const buttons = [];

    if (ctx.actionSet.has('king-gameinstance-update')) {
        buttons.push({
            children: '升级部署',
            type: 'danger',
            confirm: "确认立即升级服务器么?",
            action: 'king-gameinstance-update'
        })
    }

    if (ctx.actionSet.has('king-gameinstance-battleupdate') && global.config.game.battle) {
        buttons.push({
            children: '战斗服升级',
            type: 'danger',
            confirm: "确认立即升级战斗服么?",
            action: 'king-gameinstance-battleupdate'
        })
    }

    if (ctx.actionSet.has('king-gameinstance-clean')) {
        buttons.push({
            children: '清档',
            type: 'danger',
            modal: {
                title: "口令",
                width: "50%",
                children: {
                    _type: "AkForm",
                    form: [
                        {name: '天龙盖地虎', type: "password", key: 'pwd', require: true},
                    ],
                    action: 'king-gameinstance-clean'
                }
            },
        });
    }

    if (ctx.actionSet.has('king-gameinstance-heart')) {
        buttons.push({
            children: '心跳超时',
            type: 'danger',
            confirm: "确认踢掉心跳超时玩家?",
            action: 'king-gameinstance-heart'
        })
    }

    if (ctx.actionSet.has('king-gameinstance-repair') && global.config.game.repair) {
        buttons.push({
            children: '数据零时修复',
            type: 'danger',
            confirm: "确认修复",
            action: 'king-gameinstance-repair'
        })
    }

    return {
        _type: 'SocketContainer',
        host: global.config.agent,
        _: {
            onAction: onAction.toString()
        },
        children: [{
            _type: 'AkTable',
            id: "gameinstance-table",
            rowKey: 'id',
            size: 'small',
            buttons,
            limit: 50,
            columns,
            action: `king-gameinstance-list`
        }]
    }
};

