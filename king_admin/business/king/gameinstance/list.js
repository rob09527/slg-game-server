exports.name = '实例列表查询';
exports.type = 'I';
exports.inherit = 'gameinstance-view';
exports.exec = async function (body, query, ctx) {

    const {_page_, _sort_} = body;

    const res = await this.remote.proxy_gameinstances({});
    const {games, agent} = res;
    const items = games;
    let totalOnline = 0;
    items.forEach(c => {
        totalOnline += c.online_count
    })
    const totalExpend = [{
        title: '总在线',
        value: totalOnline
    }];
    return {
        items,
        total: items.length,
        totalExpend
    }

}
