const express = require("express")

const app = express()
const PORT = process.env.PORT || 10000

app.get("/", (req,res)=>{
res.send("DHARIK AI BOT RUNNING")
})

app.listen(PORT,()=>{
console.log("Server running on "+PORT)
})

const API_URL="https://draw.ar-lottery01.com/WinGo/WinGo_30S/GetHistoryIssuePage.json"

const TG_TOKEN="8685608225:AAH9_ncjvU38F3XxAlnXqbgmwqO7s0rIysU"
const TG_CHAT_ID="-1003558999419"

let predictions={}
let currentLevel=1
let lastProcessedPeriod=""
let lastSignal=""

const levelSettings={
1:{amount:"₹10",nextOnLoss:2},
2:{amount:"₹30",nextOnLoss:3},
3:{amount:"₹70",nextOnLoss:4},
4:{amount:"₹160",nextOnLoss:5},
5:{amount:"₹350",nextOnLoss:6},
6:{amount:"₹800",nextOnLoss:7},
7:{amount:"₹1700",nextOnLoss:8},
8:{amount:"₹3800",nextOnLoss:9},
9:{amount:"₹5000",nextOnLoss:10},
10:{amount:"₹8000",nextOnLoss:11},
11:{amount:"₹10000",nextOnLoss:12},
12:{amount:"₹15000",nextOnLoss:1}
}

async function sendTelegram(msg){

try{

await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage?chat_id=${TG_CHAT_ID}&text=${encodeURIComponent(msg)}`)

}catch(e){

console.log("telegram error")

}

}

async function updateSystem(){

try{

const res = await fetch(`${API_URL}?gameCode=WinGo_30S&timestamp=${Date.now()}`)

if(!res.ok){
console.log("API error")
return
}

const json = await res.json()

if(!json?.data?.list){
console.log("API data missing")
return
}

const list = json.data.list

if(list.length===0){
console.log("Empty history")
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

lastProcessedPeriod=last.issueNumber

}

const hist=list.slice(0,10).map(x=>parseInt(x.number)>=5?"BIG":"SMALL")

const big=hist.filter(x=>x==="BIG").length
const small=10-big

const prediction=big>=small?"BIG":"SMALL"

predictions[next]=prediction

if(lastSignal!==next){

await sendTelegram(`🚀 DHARIK AI SIGNAL 🚀

📌 PERIOD: ${next}

🎯 PREDICTION: ➡️ ${prediction}

💰 STRATEGY: LEVEL ${currentLevel} (${levelSettings[currentLevel].amount})`)

lastSignal=next

}

}catch(e){

console.log("sync error:",e.message)

}

}

function timer(){

let now=new Date()

let remain=30-(now.getSeconds()%30)

if(remain===30 && now.getMilliseconds()<500){

updateSystem()

}

}

setInterval(timer,500)
