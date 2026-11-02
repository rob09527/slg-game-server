exports.name = '事件统计查询';
exports.type = 'I';
exports.inherit = 'analyze-ltvmenus';

// 各个统计类型空数据结构
const emptyItem = {
    EVENT_DJ: {
        wei_1_rolecount: 0,
        wei_1_count: 0,
        wei_10_rolecount: 0,
        wei_10_count: 0,
        shu_1_rolecount: 0,
        shu_1_count: 0,
        shu_10_rolecount: 0,
        shu_10_count: 0,
        wu_1_rolecount: 0,
        wu_1_count: 0,
        wu_10_rolecount: 0,
        wu_10_count: 0,
        qx_1_rolecount: 0,
        qx_1_count: 0,
        qx_10_rolecount: 0,
        qx_10_count: 0,
        dm_1_rolecount: 0,
        dm_1_count: 0,
        dm_10_rolecount: 0,
        dm_10_count: 0,
    },
    EVENT_ZM: {
        normal_1_rolecount: 0,
        normal_1_count: 0,
        normal_10_rolecount: 0,
        normal_10_count: 0,
        premium_1_rolecount: 0,
        premium_1_count: 0,
        premium_10_rolecount: 0,
        premium_10_count: 0,
        friend_1_rolecount: 0,
        friend_1_count: 0,
        friend_10_rolecount: 0,
        friend_10_count: 0
    },
    EVENT_GUANXIN: {
        normal_1_rolecount: 0,
        normal_1_count: 0,
        normal_10_rolecount: 0,
        normal_10_count: 0,
        premium_1_rolecount: 0,
        premium_1_count: 0,
        premium_10_rolecount: 0,
        premium_10_count: 0
    }
}

exports.exec = async function (body, query, ctx) {
    const {_page_, _sort_, servid, date} = body;
    const event_type = query.event_type || 'EVENT_DJ';

    const match = [
        {
            "regexp": {
                "type": event_type.toLowerCase() + "_.+"  // 默认条件查询 EVENT_DJ_ 前缀的事件， 注意es 规范，必须用 小写，不然查不出来
            }
        }
    ];

    if (servid && servid !== 'ALL') {
        match.push({"term": {"servid": +servid}});
    } else {
        const servers = await this.service.game.serversOptions(ctx.adminRole);
        if (!servers.__is_all__) { // 被隔离了的就不查询全服邮件
            return {
                items: [],
                total: 0
            }
        }
    }


    if (date && date[1]) {
        const [start, end] = this.parseDateMatch(date);
        match.push({
            "range": {
                "create": {
                    "gte": new Date(start),
                    "lte": new Date(end)
                }
            }
        });
    } else {
        // 默认查最近30天
        const now = new Date();
        match.push({
            "range": {
                "create": {
                    "gte": now.setMonth(now.getMonth() - 1),
                    "lte": new Date()
                }
            }
        });
    }

    const sort = {};
    if (_sort_ && _sort_.field) {
        sort[_sort_.field] = _sort_.order;
    } else {
        sort._id = -1;
    }

    // 聚合查询 时间段内的事件操作数量
    const res = await this.service.game.elastic.search({
        index: global.config.game.es.DEF_INDEX || 'king',
        type: 'event',
        body: {
            "query": {
                "constant_score": {
                    "filter": {
                        "bool": {
                            "must": match
                        }
                    }
                }
            },
            "aggs": {
                "date": {
                    "date_histogram": {  // 先按日期分组
                        "field": "create",
                        "interval": "day",
                        "format": "yyyy-MM-dd"
                    },
                    "aggs": {
                        "type": {
                            "terms": {"field": "type.keyword"},  // 再按事件type 分组， 字符串需在后面更 .keyword
                            "aggs": {
                                "count": {
                                    "terms": {"field": "count"},  // 再按连抽count分组
                                    "aggs": {
                                        "rolecount": { // 角色去重分组
                                            "cardinality": {"field": "rid.keyword"}
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

            }
        }
    });
    const items = res.aggregations.date.buckets.map(item => {
        const tmp = {
            date: item.key_as_string,
            ...emptyItem[event_type]
        }

        for (const typeBucket of item.type.buckets) { // 点将类型分组的桶
            const type = typeBucket.key.replace(event_type + "_", '').toLowerCase(); // 取出点将类型
            for (const countBucket of typeBucket.count.buckets) { // 按连抽数分组的桶
                const c = countBucket.key;
                const count = countBucket.doc_count; // 次数指标
                const rolecount = countBucket.rolecount.value; // 角色去重的指标
                tmp[`${type}_${c}_count`] = count;
                tmp[`${type}_${c}_rolecount`] = rolecount;
            }
        }
        return tmp;
    })
    return {
        items: items,
        total: items.length
    }
};

