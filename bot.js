const express = require("express")
const fetch = require("node-fetch")

const app = express()
const PORT = process.env.PORT || 3000

app.get("/", (req, res) => {
  res.send("DHARIK AI BOT RUNNING")
})

app.listen(PORT, () => {
  console.log("Server started on port " + PORT)
})

const API_URL="https://draw.ar-lottery01.com/WinGo/WinGo_30S/GetHistoryIssuePage.json"

const TG_TOKEN="YOUR_BOT_TOKEN"
const TG_CHAT_ID="YOUR_CHAT_ID"

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

const response=await fetch(`${API_URL}?gameCode=WinGo_30S&timestamp=${Date.now()}`)
const json=await response.json()

const list=json.data.list

const lastPeriodData=list[0]

const nextPeriod=(BigInt(lastPeriodData.issueNumber)+1n).toString()

if(lastProcessedPeriod!==lastPeriodData.issueNumber){

const prevPredict=predictions[lastPeriodData.issueNumber]

const actualResult=parseInt(lastPeriodData.number)>=5?"BIG":"SMALL"

if(prevPredict){

if(prevPredict===actualResult){

await sendTelegram(`💸 WIN 💸

RESULT: ${actualResult}`)

currentLevel=1

}else{

await sendTelegram(`😓 LOSS 😓

RESULT: ${actualResult}`)

currentLevel=levelSettings[currentLevel].nextOnLoss

}

}

lastProcessedPeriod=lastPeriodData.issueNumber

}

const hist=list.slice(0,10).map(i=>parseInt(i.number)>=5?"BIG":"SMALL")

const bigCount=hist.filter(x=>x==="BIG").length
const smallCount=10-bigCount

let finalPredict=bigCount>=smallCount?"BIG":"SMALL"

predictions[nextPeriod]=finalPredict

if(lastSignal!==nextPeriod){

const signalMsg=`🚀 DHARIK AI SIGNAL 🚀

📌 PERIOD: ${nextPeriod}

🎯 PREDICTION: ➡️ ${finalPredict}

💰 STRATEGY: LEVEL ${currentLevel} (${levelSettings[currentLevel].amount})`

await sendTelegram(signalMsg)

lastSignal=nextPeriod

}

}catch(e){

console.log("sync error")

}

}

setInterval(updateSystem,30000)

updateSystem()
