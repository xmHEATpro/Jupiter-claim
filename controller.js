const { sleep, formatTime, colors, settings } = require('./helper.js');
const { createDriver } = require('./webdriver.js');
const { By, until } = require('selenium-webdriver');

const threads = settings.threads;
const customFee = settings.customFee;
const customRpc = settings.customRpc;
const seedPhrases = settings.seedPhrases;
const link = 'https://lfg.jup.ag'

async function controller(seed, tNum, sNum){
    try{
        let driver = await createDriver(tNum, sNum)
        if(driver){
            console.log(colors.green(`${formatTime(new Date())}| [Thread#${tNum+1}/${threads} | Wallet#${sNum+1}/${seedPhrases.length}] Webdriver was created!`))
            let importWalletRes = await importWallet(driver, seed)
            if(importWalletRes){
                console.log(colors.green(`${formatTime(new Date())}| [Thread#${tNum+1}/${threads} | Wallet#${sNum+1}/${seedPhrases.length}] Seed was imported!`))
                let page = await connectToPage(driver, tNum, sNum)
                if(page){
                    console.log(colors.green(`${formatTime(new Date())}| [Thread#${tNum+1}/${threads} | Wallet#${sNum+1}/${seedPhrases.length}] Wallet is connected, go to check details!`))
                    handleClaim(driver, tNum, sNum)
                }else{
                    console.log(colors.red(`${formatTime(new Date())}| [Thread#${tNum+1}/${threads} | Wallet#${sNum+1}/${seedPhrases.length}] Wallet is not connected`))
                    driver.quit()
                    return
                }
            }else{
                console.log((`${formatTime(new Date())}| [Thread#${tNum+1}/${threads} | Wallet#${sNum+1}/${seedPhrases.length}] Wallet not imported for some reasons... Try again...`))
                driver.quit()
                return
            }
        }else{
            console.log((`${formatTime(new Date())}| [Thread#${tNum+1}/${threads} | Wallet#${sNum+1}/${seedPhrases.length}] No found driver`))
            return
        }
    }catch(e){
        console.log((`${formatTime(new Date())}| Error ${e}`))
        return
    }
}

async function importWallet(driver, seedPhrase){
    try{
        await driver.get('chrome-extension://bhhhlbepdkbapadjdnnojkbgioiodbic/wallet.html#/onboard');
        const handles = await driver.getAllWindowHandles();
        await driver.switchTo().window(handles[1]);
        await driver.close();
        await driver.switchTo().window(handles[0]);

        let useSecretBtn = await driver.wait(until.elementLocated(By.xpath(`//*[@id="root"]/div/div[2]/div/div[2]/div[2]/button`)), 50000); 
        await useSecretBtn.click();
    
        let splittedSeed = seedPhrase.split(' ')
            
        for(let i=0;i<splittedSeed.length;i++){
            let word = await driver.wait(until.elementLocated(By.xpath(`//*[@id="mnemonic-input-${i}"]`)), 5000); 
            await word.sendKeys(splittedSeed[i]);
        }
    
        let importBtn = await driver.wait(until.elementLocated(By.xpath(`//*[@id="root"]/div/div[2]/div/div[2]/form/div[2]/button[2]`)), 5000); 
        await importBtn.click();

        let pass1 = await driver.wait(until.elementLocated(By.xpath(`//*[@id=":r2:"]`)), 5000); 
        await pass1.sendKeys('123');

        let pass2 = await driver.wait(until.elementLocated(By.xpath(`//*[@id=":r3:"]`)), 5000); 
        await pass2.sendKeys('123');
    
        let confirmPassCheckbox = await driver.wait(until.elementLocated(By.xpath(`//*[@id="root"]/div/div[2]/div/div[2]/form/div[2]/button[2]`)), 5000); 
        await confirmPassCheckbox.click();

        let confirmImport = await driver.wait(until.elementLocated(By.xpath(`//*[@id="root"]/div/div[2]/div/div[2]/div[2]/div/button[1]`)), 5000); 
        await confirmImport.click();

        let confirmImport2 = await driver.wait(until.elementLocated(By.xpath(`//*[@id="root"]/div/div[1]/div[2]/div[2]/button/span`)), 5000); 
        await confirmImport2.click();

        let confirmImport3 = await driver.wait(until.elementLocated(By.xpath(`//*[@id="root"]/div/div[2]/div/div[2]/button[2]/span`)), 5000); 
        await confirmImport3.click();
        
        return true
    }catch(e){
        console.log((`${formatTime(new Date())}| ${e}`))
        return false
    }
}

async function connectToPage(driver, tNum, sNum){
    try{
        console.log(`${formatTime(new Date())}| [Thread#${tNum+1}/${threads} | Wallet#${sNum+1}/${seedPhrases.length}] Connecting wallet to page...`)
        await driver.get(link);

        await sleep(1000)

        let braveBtn = await driver.wait(until.elementLocated(By.xpath(`//*[@id="__next"]/div[4]/div[1]/div/div/div/div/div/button`)), 5000); 
        await braveBtn.click();

        let solflare = await driver.wait(until.elementLocated(By.xpath(`//*[@id="__next"]/dialog/div/div[3]/div[1]/div/span`)), 5000); 
        await solflare.click();

        await sleep(3000)

        const windowHandles = await driver.getAllWindowHandles();
        let windowHandleIndex = 0;
        
        while (await driver.getTitle() !== 'Solflare') {
          windowHandleIndex++;
          const nextWindow = windowHandles[windowHandleIndex];
          await driver.switchTo().window(nextWindow);
        }

        let checkbox1 = await driver.wait(until.elementLocated(By.xpath(`//*[@id="trusted-check"]/div`)), 5000); 
        await checkbox1.click();

        let checkbox2 = await driver.wait(until.elementLocated(By.xpath(`//*[@id="auto-approve-check"]/div`)), 5000); 
        await checkbox2.click();


        let connect = await driver.wait(until.elementLocated(By.xpath(`/html/body/div[2]/div[2]/div/div[3]/div/button[2]/span`)), 5000); 
        await connect.click();

        await sleep(2000)

        const handles = await driver.getAllWindowHandles();
        await driver.switchTo().window(handles[0]);
                
        return true
    }catch(e){
        console.log(colors.red(`${formatTime(new Date())}| [Thread#${tNum+1}/${threads} | Wallet#${sNum+1}/${seedPhrases.length}] Error ${e}`))
        return
    }
}

async function handleClaim(driver, tNum, sNum){
    console.log((`${formatTime(new Date())}| [Thread#${tNum+1}/${threads} | Wallet#${sNum+1}/${seedPhrases.length}] Checking for details...`))
    await sleep(1000)



    if(customRpc!==`none`){
        try{
            let settingsBtn = await driver.wait(until.elementLocated(By.xpath(`//*[@id="__next"]/div[3]/div[1]/div/div[2]/div[1]/div/div/button`)), 5000); 
            await settingsBtn.click();
    
            let customRpcField = await driver.wait(until.elementLocated(By.xpath(`//*[@id="tooltip"]/div/div[5]/div/input`)), 5000); 
            await customRpcField.sendKeys(customRpc);
            try{
                let customRpcBtn = await driver.wait(until.elementLocated(By.xpath(`//*[@id="tooltip"]/div/div[5]/label[5]/p`)), 5000); 
                await customRpcBtn.click();
            }catch{}

            let settingsExitBtn = await driver.wait(until.elementLocated(By.xpath(`//*[@id="__next"]/div[3]/div[1]/div/div[2]/div[1]/div/div/button`)), 5000); 
            await settingsExitBtn.click();
    
        }catch(e){
            console.log(e)
        }
    }

    if(customFee!==`0.001`){
        try{
            let customFeeField = await driver.wait(until.elementLocated(By.xpath(`//*[@id="__next"]/div[3]/div[2]/div[9]/div/div[1]/div/div[2]/div[2]/div/div/input`)), 5000); 
            await customFeeField.clear();
            await customFeeField.sendKeys(customFee);
            let settingsBtn = await driver.wait(until.elementLocated(By.xpath(`//*[@id="__next"]/div[3]/div[2]/div[9]/div/div[1]/div/div[2]/div[2]/div/div/button`)), 5000); 
            await settingsBtn.click();
        }catch(e){
            console.log(e)
        }

    }

    let timeEl = await driver.wait(until.elementLocated(By.xpath(`//*[@id="__next"]/div[3]/div[2]/div[2]/div/p[1]/span`)), 5000); 
    let time = await timeEl.getText();

    console.log(`${formatTime(new Date())}| [Thread#${tNum+1}/${threads} | Wallet#${sNum+1}/${seedPhrases.length}] Lets wait ${time} to mint`)

    let mint = await driver.wait(until.elementLocated(By.xpath(`//*[@id="__next"]/div[3]/div[2]/div[3]/div/div/div/div/div/div[1]/button`)), 86400000); 
    await mint.click();

    console.log(colors.green(`${formatTime(new Date())}| [Thread#${tNum+1}/${threads} | Wallet#${sNum+1}/${seedPhrases.length}] Done!`))
}


module.exports = {
    controller,
};