const axios = require('axios'); // 需要安装 axios 来发送 HTTP 请求
const nodemailer = require('nodemailer');
// 配置你想要检查的时间点的 Unix 时间戳（秒为单位）1719874800
const TARGET_TIMESTAMP = 1722301320
let list = ['vipwdgame@gmail.com', "632230027@qq.com"]
console.log(Math.floor(TARGET_TIMESTAMP), "时间戳")
let count = 0;
let state = 0
// 定时器 ID，用于稍后清除定时器
let intervalId;
const url = 'http://127.0.0.1:8443/api/business/king-gameinstance-update'
const loginurl = 'http://127.0.0.1:8443/api/login'
let tokensystem
//const token = 'YOUR_TOKEN'
// 发送 HTTP 请求的函数
function sendRequest() {
    axios({
        method: 'post',
        url: url,
        headers: {
            'Token': tokensystem,
            'Content-Type': 'application/json'
        },
        //data: JSON.stringify({ test: 1 }) // 修正了 JSON 数据中的引号
    })
        .then(response => {
            console.log('请求成功:', response.data);
            if (response.data.result == "OK") {
                state = 1
            } else {
                state = 2
            }
        })
        .catch(error => {
            console.error('请求失败:', error);
            state = 2
            // 根据你的需求，可以选择是否继续等待或者停止定时器
            // 这里我们假设一旦失败就停止定时器
        });
}

function sendlogin() {
    axios({
        method: 'post',
        url: loginurl,
        headers: {
            //'Token': token,
            'Content-Type': 'application/json'
        },
        data: JSON.stringify({ password: "YOUR_ADMIN_PASSWORD_MD5", username: "系统更新账号" })
    })
        .then(response => {
            console.log('请求登陆成功:', response.data.result.token);
            tokensystem = response.data.result.token
            sendRequest()
        })
        .catch(error => {
            console.error('请求登陆失败:', error);
            // 根据你的需求，可以选择是否继续等待或者停止定时器
            // 这里我们假设一旦失败就停止定时器
        });
}


// 每隔 5 秒检查一次时间的函数
async function checkTime() {
    const currentTime = Math.floor(Date.now() / 1000);
    if (currentTime >= TARGET_TIMESTAMP && count < 1) {
        count += 1
        sendlogin()
    }
    console.log('当前目标北京时间', new Date(TARGET_TIMESTAMP * 1000).toLocaleString(), "距离启动还有", TARGET_TIMESTAMP - currentTime, "执行次数", count)
    if (state > 0) {
        for (let x = 0; x < list.length; x++) {
            console.log(list[x])
            await sendemail(state, list[x])
        }
        clearInterval(intervalId);
    }
}

// 开始定时器
intervalId = setInterval(checkTime, 5000); // 每隔 5 秒执行一次 checkTime 函数

async function sendemail(state, email) {
    console.log("邮件发送")
    // 创建传输器（transporter）对象
    let transporter = nodemailer.createTransport({
        service: 'qq', // 使用QQ邮箱服务
        auth: {
            user: 'YOUR_EMAIL@example.com', // 发送者邮箱地址
            pass: 'YOUR_EMAIL_AUTH_CODE' // 发送者邮箱密码（或授权码）
        }
    });

    // 邮件选项
    let mailOptions = {
        from: 'YOUR_EMAIL@example.com', // 发送者邮箱地址
        to: email, // 接收者邮箱地址
        subject: '更新完成通知', // 邮件主题
        text: state == 1 ? '更新已经成功执行完毕。' : '定时器更新异常了,手动执行一下升级部署' // 邮件内容（文本格式）
    };

    // 发送邮件
    await transporter.sendMail(mailOptions);

}

