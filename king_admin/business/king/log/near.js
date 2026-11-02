exports.name = '道具日志查询';
exports.type = 'I';
exports.inherit = 'log-prop-view';
const FORMAT = "YYYY-MM-DD";

exports.exec = async function (body, query, ctx) {

    const {rno, gsid, act, create, count, origin} = body
    const match = [];

    match.push({
        "term": {
            "rno": +rno
        }
    });

    match.push({
        "term": {
            "type": 'item_count_modify'
        }
    });

    const timestamp = body['create'];
    const stime = new Date(timestamp);
    stime.setSeconds(stime.getSeconds() - 1);
    const etime = new Date(timestamp);
    etime.setSeconds(etime.getSeconds() + 1);
    match.push({
        "range": {
            "create": {
                "gte": stime.getTime(),
                "lte": etime.getTime()
            }
        }
    });

    const esIndex = 'addcst-' + new Date(create).format(FORMAT);
    const res = await this.service.game.queryLog(esIndex, match, 0, 50, {_export_: true});
    console.log(JSON.stringify(match, null, 4), esIndex, res);
    return {
        width: '72%', // 指定弹框宽度
        children: {
            _type: 'div',
            children: res.items.map(item => {
                const style = {
                    marginBottom: 4,
                    lineHeight: 2
                };

                if (item.act === 'ADD') {
                    style.color = " #2e825c";
                } else {
                    style.color = "rgba(234,12,58,0.78)";
                }
                if (item.gsid == gsid && item.count == count) { // 判断当前行
                    style.textDecorationLine = 'underline'
                }
                let params;
                // if(item.type === 'item_count_modify'){
                    params = [
                        item.uid,
                        item.rno,
                        `${item.gsid} * ${item.act === 'ADD' ? "" : "-"}${item.count}`,
                        '数量:' + item.curcount,
                        item.create,
                        item.frompath
                    ];
                // }
                // else {
                //     style.color = "rgba(234,128,58,0.78)";
                //     params = [
                //         item.uid,
                //         item.rno,
                //         item.gsid,
                //         item.type,
                //         item.create,
                //         item.frompath
                //     ];
                // }
                return {
                    _type: 'div',
                    children: params.join('  ,  '),
                    style
                }
            })
        }
    }
};

