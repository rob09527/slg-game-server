exports.name = '自动开服设定';
exports.type = 'N';
exports.exec = async function (body, query, ctx) {

    const {auto_num, auto_pay} = body;
    if (auto_num > 3000) {
        body.auto_num = 3000;
    }
    if (auto_num < 1) {
        body.auto_num = 1;
    }
    if (auto_pay > 500) {
        body.auto_pay = 500;
    }
    if (auto_pay < 1) {
        body.auto_pay = 1;
    }
    this.remote.proxy_set_global(body);
};

