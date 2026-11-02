const moment = require("moment");
exports.name = '在线时长查询';
exports.type = 'I';
exports.inherit = 'analyze-ltvmenus';


exports.exec = async function (body, query, ctx) {
    const {
        servid,
        date,
        _page_ = {},
        _sort_,
    } = body;

    const {limit = 10, current = 1} = _page_;
    const offset = _page_.offset || (current - 1) * limit;
    const match = [
        {"term": {"type": "event_login"}}
    ];

    if (servid !== 'ALL') {
        match.push({
            term: {
                servid: +servid,
            }
        });
    } else {
        const servers = await this.service.game.serversOptions(ctx.adminRole);
        if (!servers.__is_all__)  // 被隔离了

            match.push({
                terms: {
                    servid: servers.map(s => s.value),
                }
            });
    }

    // 增加默认时间条件
    match.push(  {"range": {"create": {"gt": new Date('2021-09-10T16:00:00.000Z')} }})

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
                        "serv": {
                            "terms": {"field": "servid"},
                            "aggs": {
                                "avg_online": {
                                    "avg": {
                                        "field": "info.online_ms"
                                    }
                                }
                            }

                        }

                    }
                }

            }
        }
    });

    const sItems = [];
    const tmp = {};
    res.aggregations.date.buckets.map(item => {


        for (const sBucket of item.serv.buckets) { // 点将类型分组的桶
            const servid = sBucket.key;
            tmp[servid] = tmp[servid] || {data: [], servid};
            tmp[servid].data.push(
                {
                    key: item.key_as_string,
                    value: sBucket.avg_online.value,
                    count: sBucket.doc_count
                }
            )
        }
        return tmp;
    })
    return {
        items: Object.values(tmp),
        total: Object.keys(tmp).length
    }
}
