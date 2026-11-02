exports.name = '单人邮件';
exports.type = 'N';
exports.exec = async function (body, query, ctx) {

    const {content, _id, from, roles, reward, setreward, isanno, title, comment, day = 30} = body;

    if (!from && !_id && !roles) {
        throw 'miss _id';
    }

    const mail = util.createMail(title, content, setreward, reward, isanno, comment, day);
    if (roles) {
        const mails = roles.map(rid => ({...mail, rid: rid}));
        const mailModel = await this.service.game.collection('mails');
        const r = (await mailModel.insertMany(mails));
        return r;
    } else {
        mail.rid = from ? from.rid : _id;
        const mailModel = await this.service.game.collection('mails');
        const r = (await mailModel.insertOne(mail));
        return r;
    }


};

