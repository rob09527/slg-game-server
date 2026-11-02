# king-admin

#### 介绍

管理后台

#### 目录结构

    ├── business        // 所有服务端业务函数都放里面，处理 admin 分组，还可以自定义
    │    ├── group.json  // 各个分组的展示名映射关系
    │    └── admin       // 超级管理员功能目录，处理其他管理员生杀大权的逻辑
    ├── common          
    │    ├── bind.js     //  自定义 业务函数 对象的 this 
    │    └── util.js     //  全局 util 自定义
    ├── component       //  这是前端组件，有预设组件，也可以自定义
    │    ├── AkButton.js
    │    ├── AkEditor
    │    │   ├── index.js
    │    │   └── index.less
    │    ├── AkForm
    │    │   ├── index.js
    │    │   └── index.less
    │    ├── AkInput
    │    │   ├── index.js
    │    │   └── index.less
    │    ├── AkTable.js
    │    └── Img.js
    ├── config          //  配置目录
    │    ├── config.default.js
    │    ├── config.development.js
    │    └── config.production.js
    ├── gconfig          //  游戏配置
    ├── model          //  管理后台锁需要的数据库 model
    ├── service          //  公共底层方法
    ├── index.js        //  如果不用npm start 可以 使用 node index.js
    ├── package-lock.json
    ├── package.json    
    ├── res             //  前端资源数据
    │    ├── config.json //  页面配置
    │    ├── i18n        //  国际化配置
    │    │   ├── en-US.json
    │    │   ├── name.json   // 各个语言对应名
    │    │   └── zh-CN.json
    │    └── static          //  静态资源可以放在这里
    │        ├── favicon.ico 
    │        └── logo.png    //  logo 替换即可
    │
    ├── webpack.config.js   // 新增额外的前端主键，需要额外的 webpack配置支持，可以在这里配置
    └── www                 //  build 过后的前端包
        ├── index.css
        ├── index.html
        ├── main.css
        ├── main.js
        ├── vendors.js
        └── vendors1.css

#### 安装教程

* 本地环境
    1. ```npm install```
    2. ```npm start```

* 打包client

 ```shell
   # PS：替换了res下的资源时 需要执行 
   npm run build
 ```

* 生产环境(依赖客户端 npm run build 过后生成 www目录的前端网页内容)
    1. ```npm i --production```
    2. ```npm run start-prod or node index.js```

