
export interface AdminVo {
    id: number | string,
    email: string,
    password?: string,
    name: string,
    group: string,
    create_at: Date,
    update_at: Date,
    status: number
}

export default class AdminService {
    /**
     * 初始化管理系统数据环境
     * @return {Promise<void>}
     */
    initEnv();

    /**
     * 通过 name or  email 查询
     * @param account {string }
     * @return AdminVo
     */
    findOne(account);

    /**
     * 通过 ID 查询
     * @param id {number|string}
     * @return AdminVo
     */
    findOneById(id);

    /**
     *
     * @param obj {AdminVo}
     * @return {Promise<*>}
     */
    create(obj);


    /**
     * 修改管理员
     * @param id {number| string}
     * @param param {AdminVo}
     * @return {Promise<void>}
     */
    update(id, param);


    /**
     * 拥有功能列表
     * @param adminId {number | string}
     * @returns {Promise<string[]>}
     */
    actions(adminId);

    /**
     * 修改拥有功能
     * @param adminId {number|string}
     * @param group {string} 功能分组
     * @param actions {string[]}保留功能
     * @return {Promise<void>}
     */
    changeActions(adminId, group, actions);

    /**
     * 所有功能组
     * @return {Promise<string[]>}
     */
    groups();

    /**
     * 处理登录逻辑前的钩子函数
     * @param account {string}
     * @param password {string}
     * @param ctx
     * @return {Promise<any>}
     */
    handleLoginPrepare?(account, password, ctx);
    /**
     * 处理密码检查过后的逻辑
     * @param admin {AdminVo}
     * @param pass {boolean} 密码是否正确
     * @param ctx
     * @return {Promise<any>}
     */
    handleLogin?(admin, pass, ctx);
}
