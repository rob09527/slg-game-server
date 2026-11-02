# 帝国后端

## 基本目录说明
```
.
├── index.js
├── src
│   ├── action 事件handler
│   ├── model 数据模型,自动扫描,其中概念请自行参见mongoose文档
│   │   └── role 角色collection, 对应mongodb中roles
│   │       ├── common 自定义方法
│   │       │   └── type.js 判断gsid类型
│   │       ├── instance 实体方法
│   │       │   ├── getProp.js 获取角色道具数量
│   │       │   ├── getBattlePower.js 获取角色阵容战力
│   │       │   ├── getBattleSet.js 获取角色阵容信息
│   │       │   ├── addItemsNoSave.js 增加角色道具,需要.save()保存
│   │       │   └── castItemsNoSave.js 扣除角色道具,需要.save()保存
│   │       ├── middleware hook方法,具体请参见 mongoosejs.com/docs/middleware.html
│   │       │   ├── post.js
│   │       │   └── pre.js
│   │       ├── static model静态方法
│   │       │   ├── createRole.js 创建角色
│   │       │   └── getLastRno.js 获取最大的rno
│   │       ├── indexes.js collection索引
│   │       └── schema.js collection属性描述
│   ├── controller 接口目录
│   │   └── dev
│   │       ├── topkingpvp
│   │       │   ├── againchallenge
│   │       │   │   └── post.js 这样是一个接口,路径/dev/topking/pvp/againchallenge
│   │       │   ├── bset
│   │       │   │   └── update.js
│   │       │   ├── testrole
│   │       │   │   └── post.js
│   │       │   └── warzone
│   │       │       ├── create
│   │       │       │   └── post.js
│   │       │       └── update
│   │       │           └── post.js
│   │       └── use.js
│   ├── remote 远程调用方法
│   ├── schedule 定时操作,自动扫描
│   ├── services 公共服务
│   └── util
└── util
    └── debug_extend.js
```

* start for dev
```
    npm i
    cp config.default.json config.local.json
    npm run start-dev
```
* start for production
```shell
    pm2 start -n king-game -o /data/king/logs/out.log -e /data/king/logs/error.log index.js -- /data/king/json/config.game.json
```

## client 打包存放位置

*  解压打包zip，放到client 下， 改名为 king

*  打开地址: http://localhost:8300/king/index.html

* client 配置指定登录服务器
      
       设置 localStorage： 
            LOGIN_URL = http://127.0.0.1:8001/,

## 开发流程

* 启动 king_proxy (注意端口必须是 8001)

* 启动 king_game (注意PROXY配置需保持localhost,8001)

        PS: 如果不启动 king_proxy ，king_game启动会重复出现链接proxy的报错

* 购买商品调试过程

  * 本地启动king-game时配置中GANGER_NO_ORDER=true,这样服务器会创建开发用订单号,供后面确认使用,订单号存在global.CACHE中

  * 请求/role/payment/sys-confirm,接口仅开发使用,带上上个步骤得到的oid,服务器会执行发货逻辑

  * 非必要无需调试proxy部分逻辑

## 配置
    {
        SSL: {KEY: "/keypath", CERT: "CERTPATH" } //  增加该配置则启用 wss 协议
    }

## 服务器环境
  * docker install
```shell
sudo yum install -y yum-utils
 sudo yum-config-manager \
    --add-repo \
    https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install docker-ce docker-ce-cli containerd.io
sudo systemctl start docker    

```
  * mongo
    ```shell
        docker run -itd --name mongo -p 17016:27017 -v /data/docker/mongo/db:/data/db mongo --auth
    ```
  * elasticsearch
    
    ```shell
        docker pull elasticsearch:7.6.2
        chmod 777 -R /data/docker/elasticsearch/
        docker run --name elasticsearch -p 19200:9200 -p 19300:9300  -e "discovery.type=single-node" -e ES_JAVA_OPTS="-Xms64m -Xmx128m" -v /data/docker/elasticsearch/data:/usr/share/elasticsearch/data  -d elasticsearch:7.6.2
    ```
  * redis
    ```shell
        docker pull redis
    
        # 测试
        docker run -d --name redis -p 16379:6379 -v /data/docker/redis/db:/data redis --appendonly yes --requirepass YOUR_REDIS_PASSWORD
       
    ```

