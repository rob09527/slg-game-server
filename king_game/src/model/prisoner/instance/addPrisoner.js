

// 添加一个高级天牢武将
// {rid,servid,gsid}
module.exports = exports = async function (list) {
    let insert = []
    list.forEach(e => {
        let config = global.gameconfig.surrender.deepQueryOne('GSID', e.gsid);
        insert.push({
            rid: e.rid,
            servid: e.servid,
            gsid: e.gsid,
            type: 1,
            state: 3,
            loyal: config.LOYAL.BASE,
        })
    });
    await global.dao.prisoner.insertMany(insert)
    console.log('success', list.length)
}
