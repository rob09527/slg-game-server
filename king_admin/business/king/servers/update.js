exports.name = '编辑服务器';
exports.type = 'N';
exports.exec = async function (body, query, ctx) {

    const {servid, sno, name, groupid, room, start, area_name, area_id, filter, stype, auto_num, auto_pay, auto_create} = body;

    if (isNaN(servid)) {
        throw '无效服务ID'
    }

    if (isNaN(groupid)) {
        throw '无效合服组ID'
    }

    if (isNaN(sno)) {
        throw '无效服务器编号'
    }

    if (!name) {
        throw '请输入服务器名称'
    }
    if (!start) {
        throw '请设置服务器开服时间'
    }
    let filter_info;

    if (!Array.isArray(filter)) {
        filter_info = filter ? [filter] : [];
    } else {
        filter_info = filter;
    }

    const gameModel = await this.service.game.collection('gameservers');
    const r = await gameModel.updateOne({
        servid: +servid,
    }, {
        $set: {
            name,
            groupid: +groupid,
            room: +room || 0,
            start: new Date(start).getTime(),
            sno: +sno,
            'info.filter': filter_info,
            area: {
                name: area_name,
                id: area_id
            },
            type: stype - 1,
            auto_num,
            auto_pay,
            auto_create
        }
    })
    this.remote.proxy_load_cache("gameserver");
    return r
};

