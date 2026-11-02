
'use strict'
/**
 * 获取珍宝
 * @param {Array<Number> | Number}} zbidList 
 * @returns {}
 */
module.exports = async function({zbidList}) {
    // 珍宝model对象
    const zhenbaoModel = this.db.models.zhenbao;
    // 判断是否列表
    zbidList = Array.isArray(zbidList)? zbidList: [zbidList];
    // 查找已有珍宝
    const exist_zblist = await zhenbaoModel.find({zbId: {$in: zbidList}}, {zbId: 1});
    // 排除已有珍宝并构建新珍宝数据
    zbidList = zbidList.filter(zbid =>{
        const _zb = exist_zblist.deepQueryOne('zbId', zbid);
        return !_zb;
    }).map(zbid => ({zbId: zbid, rid: this.rid}));
    // 插入数据,返回新的数据
    return {
        zblist: await zhenbaoModel.insertMany(zbidList),
    };
}