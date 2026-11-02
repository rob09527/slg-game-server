exports.name = '全服邮件';
exports.type = 'N';
exports.exec = async function (body, query, ctx) {

    const {content, reward, servid, setreward, isanno, title, comment, day = 30} = body;

    if (!servid) {
        throw '请选择区服'
    }
    const mail = util.createMail(title, content, setreward, reward, isanno, comment, day);


    const roles = await this.service.game.collection('roles');
    const cursor = await roles.find({servid: +servid}).project({_id: 1});
    const items = await cursor.toArray();
    const mailModel = await this.service.game.collection('mails');

    const mails = items.map(one => {
        return {
            rid: one._id.toString(),
            ...mail
        }
    });
    const r = (await mailModel.insertMany(mails)).result.ok;

    return r;
};

