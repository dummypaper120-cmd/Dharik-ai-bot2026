async function updateSystem(){

try{

const res = await fetch(`${API_URL}?gameCode=WinGo_30S&timestamp=${Date.now()}`)
const json = await res.json()

if(!json.data || !json.data.list){
console.log("API data missing")
return
}

const list = json.data.list

if(list.length === 0){
console.log("No history data")
return
}

const last = list[0]

const next = (BigInt(last.issueNumber)+1n).toString()

if(lastProcessedPeriod!==last.issueNumber){

const prev = predictions[last.issueNumber]

const actual = parseInt(last.number)>=5?"BIG":"SMALL"

if(prev){

if(prev===actual){

await sendTelegram(`💸 WIN 💸

RESULT: ${actual}`)

currentLevel=1

}else{

await sendTelegram(`😓 LOSS 😓

RESULT: ${actual}`)

currentLevel=levelSettings[currentLevel].nextOnLoss

}

}

lastProcessedPeriod = last.issueNumber

}

const hist=list.slice(0,10).map(x=>parseInt(x.number)>=5?"BIG":"SMALL")

const big=hist.filter(x=>x==="BIG").length
const small=10-big

const prediction = big>=small?"BIG":"SMALL"

predictions[next]=prediction

if(lastSignal!==next){

await sendTelegram(`🚀 DHARIK AI SIGNAL 🚀

📌 PERIOD: ${next}

🎯 PREDICTION: ➡️ ${prediction}

💰 STRATEGY: LEVEL ${currentLevel} (${levelSettings[currentLevel].amount})`)

lastSignal=next

}

}catch(e){

console.log("sync error",e)

}

}
