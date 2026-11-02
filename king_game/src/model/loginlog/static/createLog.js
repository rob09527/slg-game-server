'use strict'
const moment = require('moment');
/**
 * 创建一个boss
 * @param role {{_id: ObjectId, platform: string, channel: string}}
 * @author awko
 */
module.exports = exports = async function (role ) {
    if (!role || !role._id){
        return ;
    }
    console.log( role.rno,' LOGIN ', moment().format('YYYY-MM-DD HH-mm-ss'));
    const log = await this.create({
        rid: role._id,
        platform: role.platform,
        uid: role.uid,
        servid: role.servid,
        channel: role.channel,
        bundle: role.bundle,
        date: Date.now()
    });
    return log;
}
