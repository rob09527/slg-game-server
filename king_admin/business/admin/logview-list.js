exports.name = '日志查询';
exports.type = 'I';
exports.inherit = 'logview';
exports.exec = async function (body, query, ctx) {

    const {_page_, adminName, actionName , create, where: whereStr} = body;
    const {limit, current} = _page_;

    let where = {};
    if (adminName){
        where.adminName = new RegExp(adminName);
    }
    if(actionName){

        const id = Object.keys(businessMap).find(k => businessMap[k].name === actionName.trim());
        if (id){
            where.action = id
        } else {
            where.action = actionName;
        }
    }
    if(create && create[0]){
        where.create_at = {
            $gte: create[0],
            $lte: create[1]
        }
    }
    if(whereStr){
        for (const w of whereStr.split(',')) {
            const c = w.split("=");
            const v = c[1] || "";
            where[c[0]] = isNaN(v)? v : {
                $in: [v, +v]
            };
        }
    }

    const sort = {};

    sort._id = -1;

    const offset = (current - 1) * limit;

    let items = await this.db.mongo.log.find(where).sort(sort).limit(limit).skip(offset);
    const total = await this.db.mongo.log.count(where);
    items = items.map(it => {
        it = it.toObject();
        it.actionName = businessMap[it.action] ?  businessMap[it.action].name : it.action;
        it.id = it._id;
        const body = JSON.stringify(it.body) || "";
        it.body = body.replace(/,/g, "|");
        return it;
    });
    return {
        items,
        total
    }

}
