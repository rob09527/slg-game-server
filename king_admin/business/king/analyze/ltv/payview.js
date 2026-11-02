exports.name = 'LTV留存数据版';
exports.type = 'I';
exports.inherit = 'analyze-ltvmenus';

exports.exec = async function (body, query, ctx) {
    const servers = await this.service.game.serversOptions(ctx.adminRole);
    const bundles = await this.db.mongo.bundle.getBundles(ctx.adminRole);
    const type = query.type ? +query.type : +body.type;

    const filter = [
        {
            key: 'bundle',
            name: '包名',
            type: 'select',
            mode: "multiple",
            style: {minWidth: 230},
            _tooltip: '可以长按选项试试效果',
            options: [...bundles]
        },
        {
            key: 'date',
            type: 'date',
            name: '注册日',
            pickerType: 'RangePicker'
        }
    ];
    if (type === 1) {
        filter.unshift({
            key: 'servid',
            name: '服务器',
            type: 'select',
            showSearch: true,
            style: {minWidth: 180},
            options: servers
        })
    }
    const cName = {
        "todayActive": "留存率",
        "addPayCount": "转化率",
        "addPayTotal": "ltv"
    }
    const columns = [
        {
            title: '注册日',
            dataIndex: 'date',
            width: 180
        },
        {
            title: '付费数' ,
            dataIndex: 'roleCount'
        },
        {
            title: '注册数',
            dataIndex: 'createCount'
        },
        {
            title: '最终' + cName[query.id || body.id],
            dataIndex: 'last',
        },
        {
            title: '昨日' + cName[query.id || body.id],
            dataIndex: 'yester',
        }
    ].filter(Boolean);
    //


    const handleData = (data) => {
        let {items, total, time} = data;
        const ayzKey = this.props ? this.props.ayzKey : body.id;
        let maxCol = 0;
        const parse = (mChild, obj, k) => {
            if (ayzKey === 'addPayCount' || ayzKey === 'todayActive') { // 转化率 留存率
                obj[k] = (mChild[k] * 100 / (obj.roleCount || 1)).toFixed(2) + '%';
            } else if (ayzKey === 'addPayTotal') {
                obj[k] = (mChild[k] / (obj.roleCount || 1)).toFixed(2);
            }
        }
        items = items.map(item => {
            const {analyze, ...obj} = item;
            obj.date = obj._id;
            const mChild = {};
            obj.children = [mChild]; // addPayCount
            // 得到最长一条数据
            analyze.forEach(a => maxCol = Math.max(a.length, maxCol));
            mChild.last = 0;
            mChild.yester = 0;

            // 汇总数据
            for (let i = 0; i < maxCol; i++) {
                const k = `day${i + 1}`;
                mChild[k] = mChild[k] || 0;
                for (const a of analyze) {
                    mChild[k] += (a[i] ? a[i][ayzKey] : 0);
                }

                mChild.yester = mChild.last;
                if (ayzKey === 'todayActive') {
                    mChild.last = mChild[k]; // 留存活跃不做累加
                } else {
                    mChild.last += mChild[k];
                    mChild[k] = "+" + mChild[k];
                }
                parse({[k]: mChild.last}, obj, k);
            }
            parse(mChild, obj, 'last');
            parse(mChild, obj, 'yester');

            return obj;
        })

        maxCol = Math.max(20, maxCol); // 保证 20列，不然前端效果异常
        const expendColumns = [];
        for (let i = 1; i <= maxCol; i++) {
            const key = 'day' + i;
            expendColumns.push({
                title: i === 1 ? '当日' : i === 2 ? '次日' : i + '日',
                dataIndex: key,
                width: 80,
            });
        }
        return {expendColumns, items, total, time};
    }

    let title = (type === 0 ? '账号' : '角色') + cName[query.id || body.id];

    return {
        _type: 'AkTable',
        buttons: [
            {
                children: "全渠道导出",
                download: 'king-analyze-ltv-download?type=' + type + "&id=" + query.id,
                type: "primary",
            },
            {
                children: '刷新当日',
                action: 'king-analyze-ltv-flush',
                confirm: '刷新当日数据可能需要1分钟左右完成,访问超时也属于正常现象,超时报错您可以在5分钟后回来观察数据即可!',
                _tooltip: '刷新当日的实时数据'
            },
            ctx.adminRole === 'SUPER_MANAGER' && {
                children: '重刷指定日期',
                _tooltip: '可能需要1分钟左右完成',
                modal: {
                    children: {
                        _type: 'AkForm',
                        action: 'king-analyze-ltv-flush',
                        form: [
                            {
                                key: 'ndate',
                                name: '指定日期',
                                type: 'date',
                            }
                        ],
                        confirm: '确认重刷，会覆盖之前数据？'
                    },
                }
            }
        ].filter(Boolean),
        title: title,
        key: query.id + type,
        filter,
        filter_history: true,
        size: 'small',
        ayzKey: query.id,
        limit: 15,
        download: {
            url: `download?action=king-analyze-ltv-view`,
            body: {
                type: '' + type,
                pay: 1,
                id: query.id
            }
        },
        columns,
        action: `king-analyze-ltv-list?id=${query.id|| body.id}&type=${type}&pay=1`,
        handleData: body._export_ && handleData,
        _: {
            handleData: handleData.toString()
        }
    }
};

