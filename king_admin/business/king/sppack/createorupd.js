exports.name = '礼包商品管理';
exports.type = 'N';

exports.exec = async function (body, query, ctx) {
    const {items, pid, pname, price, status} = body;

    const createOrUpdate = async (pid, pname, price, status) => {
        const r = await this.db.mongo.sppack.findOneAndUpdate({pid}, {
            $set: {
                pname,
                price: +price,
                status: status === '允许' ? 1 : 0
            }
        }, {
            upsert: true
        });
        return r;
    }
    global.SPPACK_LIST = null;
    if (pid) {
        const r = await createOrUpdate(pid, pname, price, status);
        return r;
    } else if (items && items[0] && items[0].data) { // 表格导入提交
        const data = items[0].data;
        if (!Array.isArray(data) || !data[0] || !data[0]['礼包ID']) {
            throw '表格格式不正确';
        }
        //
        await this.db.mongo.sppack.deleteMany({});
        // 礼包ID: "charge6", 礼包名: "充值6元", 礼包价格: 6, 是否允许模拟充值: "不允许", 操作: ""
        for (const item of data) {
            await createOrUpdate(item['礼包ID'], item['礼包名'], item['礼包价格'], item['是否允许模拟充值'])
        }
        return 'ok';
    }


    return "-";
};

