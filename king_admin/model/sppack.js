const {Schema} = require('mongoose');
/**
 * 渠道和包名数据
 * @param connMap
 * @return {*}
 */
module.exports = function (connMap, app) {
    const conn = connMap['main']; //
    const MSchema = new Schema({
        pid: {
            type: String,
            required: true,
            unique: 1,
        }, // 商品ID
        pname: { // 商品名
            type: String
        },
        price: { // 价格
            type: Number
        },
        status: {
            type: Number,
            default: 0
        }
    });


    MSchema.statics.getSppacks = async function (status) {

        if (!global.SPPACK_LIST) {
            const match = {};
            let mlist = await this.find(match);
            global.SPPACK_LIST = mlist.map(l => ({value: l.pid, status: l.status, name: `${l.pname}-${l.price}`}));
        }
        if (status !== undefined) {
            return global.SPPACK_LIST.filter(l => l.status === status);
        }
        return global.SPPACK_LIST;
    }
    return conn.model('Sppack', MSchema, 'Sppack');
}
