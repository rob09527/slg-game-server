const fs = require('fs');

exports.name = '管理员状态更新';
exports.type = 'N';
exports.exec = async function (body, query, ctx) {
    const {rowData = {}, status: value} = body;


    if(!rowData.name || !rowData.id){
        throw 'invalid name'
    }
    if (rowData.id == ctx.adminId){
        throw 'owner cant reset';
    }
    if(rowData.name === 'admin'){
        throw 'super admin status cant reset'
    }
    const param = {status: value?0:1 };
    const id = isNaN(rowData.id) ? rowData.id : +rowData.id;
    const r = await this.service.admin.update(id, param);

    if (param.status === 1) {      // 禁止了管理员
        // 提管理员操作

        if (mSession[id]) {
            mSession[mSession[id]] = undefined;
        }
        mSession[id] = undefined;
        if(fs.existsSync(_TOKEN_PATH + id + '.json')){
            fs.unlinkSync(_TOKEN_PATH + id + '.json'); // 删除掉 token
        }
    }
    return r;
}
