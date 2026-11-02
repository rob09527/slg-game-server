module.exports = exports = async function (xxl) {
    await global.dao.xxl.updateOne({ rid: xxl.rid, label: xxl.label }, xxl)
}