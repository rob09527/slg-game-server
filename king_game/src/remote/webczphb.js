

module.exports = async function (amount, rid) {
    let id = "czphb"
    const role = await global.dao.role.findOne({ _id: rid });
    const zhd = global.config.ZHD[id.toUpperCase()];
    const [start, end] = zhd;
    console.log(new Date(end))
    if (ACTIVITY[id] && Date.in(start, end)) {
        role.addItemsNoSave([{ gsid: global.gameconfig[id][0][1].key, count: amount }])
        await role.save();
        let rankService = new global.services.RankService(`${id}-${global.gameconfig[id][0][1].key}`);
        let score = Math.ceil(role.getItems(global.gameconfig[id][0][1].key).count)
        await rankService.set({
            id: role.i(),
            score: score
        });
    }
}
