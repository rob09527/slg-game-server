const BaseService = require('awko-admin/base.service');

const moment = require('moment')
const FORMAT = 'YYYY-MM-DD_HH:mm:ss'

/**
 * 默认使用 mongo 版数据库 则使用该 service
 * 删除 admin.service 修改该文件为 admin.service 即可
 * @type {AdminService}
 */
module.exports = class AdminService extends BaseService {

    // constructor(app) { // if you need
    //     super(app);
    // }

    /**
     * 初始化管理系统数据环境
     * @return {Promise<void>}
     */
    async initEnv() {
        const one = await this.app.db.mongo.admin.findOne();
        if (!one) { // 初始化表
            console.log(`init tables`);
            const am = await this.app.db.mongo.admin.create({
                name: 'admin',
                group: 'SUPER_MANAGER',
                email: 'admin',
                password: 'YOUR_ADMIN_PASSWORD_MD5',
                create_at: new Date(),
            });
            await this.app.db.mongo.adminAction.create([
                {admin_id: am._id.toString(), action: "admin-authority-update", status: 0},
                {admin_id: am._id.toString(), action: "admin-create", status: 0},
                {admin_id: am._id.toString(), action: "admin-logview", status: 0},
                {admin_id: am._id.toString(), action: "admin-manager", status: 0},
                {admin_id: am._id.toString(), action: "admin-update", status: 0}
            ])
            console.log(`init tables end`);
        }
    }

    /**
     * 通过 name or  email 查询
     * @param account {string }
     * @return AdminVo
     */
    async findOne(account) {
        let admin = await this.app.db.mongo.admin.findOne({$or: [{name: account}, {email: account}]});
        if (admin) {
            admin = admin.toObject();
            admin.id = admin._id.toString();
            admin.role = admin.group;
        }
        return admin;
    }

    /**
     * 通过 ID 查询
     * @param id
     * @return AdminVo
     */
    async findOneById(id) {
        let admin = await this.app.db.mongo.admin.findOne({_id: id});
        if (admin) {
            admin = admin.toObject();
            admin.id = admin._id.toString();
        }
        return admin;
    }

    /**
     *
     * @param obj {AdminVo}
     * @return {Promise<*>}
     */
    async create(obj) {
        const {name, email, group} = obj;
        let password = obj.password || 'YOUR_ADMIN_PASSWORD_MD5'; // 默认口令的 md5，部署时替换
        password = config.encryptPassword(password);
        let old = (await this.findOne(name)) || (await this.findOne(email));
        if (old) {
            throw 'admin exists';
        }

        return this.app.db.mongo.admin.create({
            name,
            email,
            group,
            password
        });
    }


    handleLoginPrepare(account, password, ctx) {
        console.log('CALL LOGIN', account, ctx.request.ip, moment().format(FORMAT));
    }

    /**
     *
     * @param admin {AdminVo}
     * @param pass {boolean} 密码是否ok
     * @return {Promise<void>}
     */
    handleLogin(admin, pass) {
        if (admin.password_error_history && admin.password_error_history.error_count >= 10) {
            const now = Date.now();
            if (new Date(admin.password_error_history.last_time).getTime() - now < 3600 * 1000 * 48) {
                // 锁 48小时
                throw 'your account locked'
            }
        }
        if (pass) {

            // if (process.env.NODE_ENV === 'production') { // 生产环境要求强制修改密码
            if (admin.password === 'YOUR_ADMIN_PASSWORD_MD5') {
                admin.do_action = 'showResetPwd';
                admin.message = 'Your password is too simple. Please change it immediately';
            }
            // }

            this.app.db.mongo.admin.updateOne({_id: admin.id}, {$set: {'password_error_history.error_count': 0}}).catch(console.error);
            return;
        }

        this.app.db.mongo.admin.updateOne({_id: admin.id}, {
            $inc: {
                'password_error_history.error_count': 1,
            },
            $set: {
                'password_error_history.last_time': new Date()
            }
        }).catch(console.error);
        if (admin.password_error_history && admin.password_error_history.error_count > 5) {
            throw `Your account will be locked after ${Math.max(9 - admin.password_error_history.error_count, 0)} attempts`;
        }
    }

    /**
     * 修改管理员
     * @param id {number| string}
     * @param param {AdminVo}
     * @return {Promise<void>}
     */
    async update(id, param) {
        delete param._id;
        return this.app.db.mongo.admin.updateOne({
            _id: id
        }, {$set: param});
    }


    /**
     * 拥有功能列表
     * @param adminId {number | string}
     * @returns {Promise<string[]>}
     */
    async actions(adminId) {
        const actions = await this.app.db.mongo.adminAction.find({admin_id: adminId});
        return actions.map(a => a.action);
    }

    /**
     * 修改拥有功能
     * @param adminId {number|string}
     * @param group {string} 功能分组
     * @param actions {string[]}保留功能
     * @return {Promise<void>}
     */
    async changeActions(adminId, group, actions) {
        adminId = isNaN(adminId) ? adminId : +adminId;
        let actionRange = Object.values(businessMap).filter(b => b.type === 'N').filter(b => b.group ? b.group === group : group === '__others').map(b => b.id);
        const mactions = await this.app.db.mongo.adminAction.find({admin_id: adminId, action: {$in: actionRange}});
        const needDel = mactions.filter(one => actions.indexOf(one.action) === -1).map(o => o._id);
        if (needDel.length > 0) {
            await this.app.db.mongo.adminAction.deleteMany({_id: {$in: needDel}});
        }
        if (actions.length > 0) {
            // 捕获已经存在的，
            const exists = {};
            mactions.forEach(o => exists[o.action] = 1);
            await this.app.db.mongo.adminAction.create(actions.filter(o => exists[0] !== 1).map(o => ({
                admin_id: adminId,
                action: o
            }))).catch(e => e);
        }
        return {msg: 'ok'};
    }

    async groups() {
        const r = await this.app.db.mongo.admin.aggregate([{
            $group: {
                _id: '$group'
            }
        }]);

        return r.map(_ => _._id);
    }
}
