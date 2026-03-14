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
let lastPeriod=""
let lastSignal=""

const levels={
1:{amount:"₹10",next:2},
2:{amount:"₹30",next:3},
3:{amount:"₹70",next:4},
4:{amount:"₹160",next:5},
5:{amount:"₹350",next:6},
6:{amount:"₹800",next:7},
7:{amount:"₹1700",next:8},
8:{amount:"₹3800",next:9},
9:{amount:"₹5000",next:10},
10:{amount:"₹8000",next:11},
11:{amount:"₹10000",next:12},
12:{amount:"₹15000",next:1}
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
const json = await res.json()

if(!json?.data?.list) return

const list=json.data.list
const last=list[0]

const next=(BigInt(last.issueNumber)+1n).toString()

if(lastPeriod!==last.issueNumber){

const prev=predictions[last.issueNumber]
const actual=parseInt(last.number)>=5?"BIG":"SMALL"

if(prev){

if(prev===actual){
await sendTelegram(`💸 WIN 💸\n\nRESULT: ${actual}`)
currentLevel=1
}else{
await sendTelegram(`😓 LOSS 😓\n\nRESULT: ${actual}`)
currentLevel=levels[currentLevel].next
}

}

lastPeriod=last.issueNumber

}

const hist=list.slice(0,10).map(x=>parseInt(x.number)>=5?"BIG":"SMALL")

const big=hist.filter(x=>x==="BIG").length
const small=10-big

const prediction=big>=small?"BIG":"SMALL"

predictions[next]=prediction

if(lastSignal!==next){

await sendTelegram(`🚀 DHARIK AI SIGNAL 🚀

📌 PERIOD: ${next}

🎯 PREDICTION: ${prediction}

💰 STRATEGY: LEVEL ${currentLevel} (${levels[currentLevel].amount})`)

lastSignal=next

}

}catch(e){

console.log("sync error",e.message)

}

}

setInterval(updateSystem,30000)
updateSystem()
