'use strict'


// 定时器
exports.name = "友情点赠送记录"; // 类似一句中文注释，后续后台可以展示该名字,

// 定时器语句
exports.cron = "0 0 0 * * *";

/**
 * 定时器主体函数
 * 异常直接抛出就行
 * @return {Promise<void>}
 */
exports.main = async function () {
    
    // 清理友情点发送记录
    await global.dao.fpoint.deleteMany({});
    // let count = await global.dao.role.find().count();
    // let pagesize = Math.ceil(count / 1000);
    // for(let i =0 ;i<pagesize;i++){
    //     let m = i * 1000;
    //     let roles = await global.dao.role.find({},{_id:1}).skip(m).limit(1000);
    //     let keys = [];
    //     for(let role of roles){
    //         keys.push('friend:'+role._id);
    //         keys.push('psendmap:'+role._id);
    //         keys.push('preceivemap:'+role._id);
    //     }
    //     await global.services.FriendService.del(keys);

    // }
}

/**
 * 结果检测函数 (可以不设置检测函数)
 * @return {Promise<boolean>}
 */
exports.check = async function () {
    return true;
}
