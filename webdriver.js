const { formatTime, colors, settings } = require('./helper.js');
const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

var path = require('chromedriver').path;
let service = new chrome.ServiceBuilder(path);

const threads = settings.threads;
const seedPhrases = settings.seedPhrases;

async function createDriver(tNum, sNum){
    try{
        console.log(`${formatTime(new Date())}| [Thread#${tNum+1}/${threads} | Wallet#${sNum+1}/${seedPhrases.length}] Starting..`)
        let chromeOptions = new chrome.Options();
        chromeOptions.excludeSwitches('enable-logging');
        chromeOptions.addArguments("--window-size=1080,880")
        chromeOptions.addExtensions('./solflare.crx'); 
        let driver = await new Builder()
        .forBrowser("chrome")
        .setChromeService(service)
        .withCapabilities(chromeOptions)
        .build();
        return driver
    }catch(e){
        console.log(colors.red(`${formatTime(new Date())}| [Thread#${tNum+1}/${threads} | Wallet#${sNum+1}/${seedPhrases.length}] Error in createDriver ${e}`))
    }
}

module.exports = {
    createDriver,
};