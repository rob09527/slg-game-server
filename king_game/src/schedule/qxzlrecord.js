const cursorUtil = require("../util/cursor");
const {ObjectId} = require("mongodb");
// 定时器
exports.name = "群雄逐鹿-清理战绩"; // 类似一句中文注释，后续后台可以展示该名字,

// 定时器语句 每日的4点
exports.cron = "0 0 4 * * 1";
// exports.cron = "*/10 * * * * *"; //测试

/**
 * 定时器主体函数
 * 异常直接抛出就行
 * @return {Promise<void>}
 */
exports.main = async function () {
    const roles = {};
    let saveRid = {};
    let findRole = async (rid)=>{
        if (roles[rid]) {
            return roles[rid];
        }
        let role = await global.dao.role.findOne({_id:ObjectId(rid)},{qxzlrecord:1});
        if (!role) {
            return;
        }
        roles[rid] = {qxzlrecord:role.qxzlrecord};
        return roles[rid];
    }
    let delVideos = [];
    const cond = {create :{$lt:Date.now() - 3 * 24 * 3600 * 1000}};
    let arr = [];
    await cursorUtil(global.dao.c_qxzlrecord.find(cond), async (record)=>{
        let id = record._id.toString();
        for (let {rid} of record.player) {
            const role = rid ? await findRole(rid) : null;
            if (!role) {
                continue;
            }
            for (let type in role.qxzlrecord) {
                let pos = role.qxzlrecord[type].indexOf(id);
                if (pos > -1) {
                    role.qxzlrecord[type].splice(pos, 1);
                    saveRid[rid] = true;
                    break;
                }
            }
        }
        record.ids.forEach(({vid})=>{
            delVideos.push(ObjectId(vid))
        });
        arr.push(record.remove());
    });
    delVideos.length && await global.dao.video.deleteMany({_id:{$in:delVideos}});
    for (let rid in saveRid) {
        let role = roles[rid];
        if (!role) {
            continue;
        }
        arr.push(global.dao.role.updateOne({_id:rid},{$set:{qxzlrecord:role.qxzlrecord}}));
    }
    await Promise.all(arr);
}

/**
 * 结果检测函数 (可以不设置检测函数)
 * @return {Promise<boolean>}
 */
exports.check = async function () {
    return true;
}