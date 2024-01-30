const { formatTime, colors, settings } = require('./helper.js');
const { controller } = require('./controller.js');
const threads = settings.threads;
const seedPhrases = settings.seedPhrases;

async function initiate(){
    try{
        if(threads && seedPhrases){
            if(seedPhrases.length>0){

                console.log(colors.yellow(`${formatTime(new Date())}| Seeds: ${seedPhrases.length} | Threads: ${threads} | Total windows: ${threads*seedPhrases.length}`))
                try{
                    for(let s=0;s<seedPhrases.length;s++){
                        for(let i=0;i<threads;i++){
                                await controller(seedPhrases[s], i, s)
                        }
                    }
                }catch(e){
                    console.log(`${formatTime(new Date())}| Error in driverController ${e}`)
                }
            }else{
                console.log(colors.red(`${formatTime(new Date())}| Cant find seed phrases in ${seedPhrases}`))
            }
        }else{
            console.log(colors.red(`${formatTime(new Date())}| Settings not filled`))
        }
    }catch(e){
        console.log(colors.red(`${formatTime(new Date())}| Error in initiate ${e}`))
    }
}



initiate()