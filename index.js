const Wechat = require('wechat4u');
const WechatCore = require('wechat4u/lib/core')
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const CronJob = require('cron').CronJob;

let bot;
let username;

// Check local sync data to avoid scan qrcodes
try {
    bot = new Wechat(require('./sync-data.json'));
} catch (e) {
    bot = new Wechat();
}

if (bot.PROP.uin) {
    bot.restart();
} else {
    bot.start();
}

// qrcode generate
bot.on('uuid', uuid => {
    qrcode.generate('https://login.weixin.qq.com/l/' + uuid, {
        small: true
    });
    console.log('二维码链接：', 'https://login.weixin.qq.com/qrcode/' + uuid);
});

// on successful login
bot.on('login', () => {
    console.log('登录成功');
    fs.writeFileSync('./sync-data.json', JSON.stringify(bot.botData));
});

// on logout
bot.on('logout', () => {
    console.log('登出成功');
    fs.unlinkSync('./sync-data.json');
});

bot.on('message', msg => {
    if(msg.Content.indexOf('中秋') !== -1 ){
        // not repy group chat message
        if(!(msg.FromUserName ? /^@@|@chatroom$/.test(msg.FromUserName) : false)){
            bot.sendMsg('谢谢，也祝你中秋节快乐！', msg.FromUserName)
            .catch(err => {
                bot.emit('send error', err);
            });
        }
    }
})