exports.name = 'H5商品导出';
exports.type = 'N';

const fs = require("fs");
const assert = require('assert');

const savetConfig = (data, lan) => {
    const DOC_PATH = global.config.docspath
    const OUT_PATH = DOC_PATH + "/output/output_gm"; // 脚本路径

    let lanpath = lan ? `/${lan}` : '';
    const dpath = `${OUT_PATH}${lanpath}/`;

    const cnf = 'commodity.json';
    const str = fs.writeFileSync(dpath + cnf, data, {encoding: 'utf8', flag: "w+"});
    console.log(str);
};

exports.exec = async function (body, query, ctx) {
    const commodities = await this.service.game.collection('commodities');
    const c = await commodities.find()
    const data = await c.toArray();
    for (const b of data) {
        delete b._id;
    }
    console.log("save", data)
    savetConfig(JSON.stringify(data));
    return 'ok';
};

