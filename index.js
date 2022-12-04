import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import { MongoClient, ObjectId} from "mongodb"
import axios from "axios"
import {CronJob} from "cron"
import {spawn} from "child_process"



const PORT = process.env.PORT|| 3001;
const app=express()
app.use(cors())
app.use(bodyParser.urlencoded({extended:true}))
app.listen(PORT,()=>{
    console.log("run");
})

//cron jobs
const setUnsetPercentbuysell=()=>{
  MongoClient.connect("mongodb+srv://apo:jac2001min@cluster0.pdunp.mongodb.net/player?retryWrites=true&w=majority", function(err, db) {
    if (err) throw err;
    var dbo = db.db("player");
    dbo.collection("calcio").updateMany({},{$set:{percentbuysell:{buy:0,sell:0}}},(err,result)=>{
      if (err) throw err;
    })
  })
}
const job = new CronJob('* * * * * *', setUnsetPercentbuysell);

job.start()

const runPython=()=>{
  const pythonProcess =spawn("python",["../../scrapping/footballPlayer/transfermarketMongoDB.py"])
  pythonProcess.stdout.on('data', (data,err) => {
    if (err){console.log(err);}
  console.log(data.toString());
  });
}
const job2= new CronJob('* * * * * *', runPython);

job2.start()


app.get("/premi", async (req,res)=>{
  //https://couponapi.org/api/getFeed/?API_KEY=dd0c65f351c23560535b8501db5b1721
  axios.get("https://couponapi.org/api/getFeed/?API_KEY=dd0c65f351c23560535b8501db5b1721&format=json&incremental=0&last_extract=1669205598&off_record=1").then(result=>{
    res.send(JSON.stringify(result.data));
  })
})
app.get("/calcio", async (req,res)=>{
    MongoClient.connect("mongodb+srv://apo:jac2001min@cluster0.pdunp.mongodb.net/player?retryWrites=true&w=majority", function(err, db) {
        if (err) throw err;
        var dbo = db.db("player");
        dbo.collection("calcio").find({}).toArray(function(err, result) {
          if (err) throw err;
          res.send(result)
        });
    });
})
app.get("/nfl", async (req,res)=>{
    MongoClient.connect("mongodb+srv://apo:jac2001min@cluster0.pdunp.mongodb.net/player?retryWrites=true&w=majority", function(err, db) {
        if (err) throw err;
        var dbo = db.db("player");
        dbo.collection("nfl").find({}).toArray(function(err, result) {
          if (err) throw err;
          res.send(result)
        });
      });
})
//funzione che parte quando premo buy
app.put("/update", async (req,res)=>{
  let i=JSON.parse(Object.keys(req.body)[0])
  let valore
  if (i.prezzo*10000000>=1000000){
    valore= { valore:"€"+parseFloat(i.prezzo*10).toPrecision(3)+"m"}
  }else{
    valore={valore:"€"+parseFloat(i.prezzo*10000).toPrecision(3)+"Th"}
  }
  if (i.idToBuy!=""){
    //cambia in valoreSell il volume delle azioni diminuendole in base a quante sono state acquistate
    MongoClient.connect("mongodb+srv://apo:jac2001min@cluster0.pdunp.mongodb.net/player?retryWrites=true&w=majority", function(err, db) {
      if (err) throw err;
      var dbo = db.db("player");
      let diff=i.qtyToBuy-i.qty
      if(diff<0){
        diff=0
      }
      dbo.collection("calcio").updateOne({_id:new ObjectId(i.id),"valoreSell.idSell":i.idToBuy},{$set:{"valoreSell.$.volume":diff}},(err,result)=>{
        if (err) throw err;
        res.send(result)
      })
    });
  }
  //cambia il valore in base a quanto è stata acquistata l'azione
  MongoClient.connect("mongodb+srv://apo:jac2001min@cluster0.pdunp.mongodb.net/player?retryWrites=true&w=majority", function(err, db) {
    if (err) throw err;
    var dbo = db.db("player");
    dbo.collection("calcio").updateOne({_id:new ObjectId(i.id)},{$push:valore},(err,result)=>{
      if (err) throw err;
      res.send(result)
    })
  });
  //aggiunge 1 a buy di percentbuysell
  MongoClient.connect("mongodb+srv://apo:jac2001min@cluster0.pdunp.mongodb.net/player?retryWrites=true&w=majority", function(err, db) {
    if (err) throw err;
    var dbo = db.db("player");
    let buy
    let sell
    dbo.collection("calcio").find({_id:new ObjectId(i.id)}).toArray(function(err, result) {
      if (err) throw err;
      if (result[0].percentbuysell) {
        buy=(result[0].percentbuysell.buy);
        sell=(result[0].percentbuysell.sell);
      }
      let valore={percentbuysell:{buy:buy+1,sell:sell}}
      dbo.collection("calcio").updateOne({_id:new ObjectId(i.id)},{$set:valore},(err,result)=>{
        if (err) throw err;
      })
    });
  });
  
})
//parte quando premo sell
app.put("/update-sell", async (req,res)=>{
  let i=JSON.parse(Object.keys(req.body)[0])
  let valore
  if ((i.prezzoSold)*10000000>=1000000){
    valore= { valoreSell:{idSell:i.idSell,prezzoSell:i.prezzoSold,volume:i.volume}}
  }else{
    valore={valoreSell:{idSell:i.idSell,prezzoSell:i.prezzoSold,volume:i.volume}}
  }
  //aggiunge a valoreSell le specifiche di chi vende l'azione, quante azioni vende e a che prezzo
  MongoClient.connect("mongodb+srv://apo:jac2001min@cluster0.pdunp.mongodb.net/player?retryWrites=true&w=majority", function(err, db) {
    if (err) throw err;
    var dbo = db.db("player");
    dbo.collection("calcio").updateOne({_id:new ObjectId(i.id)},{$push:valore},(err,result)=>{
      if (err) throw err;
      res.send(result)
    })
  });
  //aggiunge 1 a sell di percentbuysell
  MongoClient.connect("mongodb+srv://apo:jac2001min@cluster0.pdunp.mongodb.net/player?retryWrites=true&w=majority", function(err, db) {
    if (err) throw err;
    var dbo = db.db("player");
    let sell
    let buy
    dbo.collection("calcio").find({_id:new ObjectId(i.id)}).toArray(function(err, result) {
      if (err) throw err;
      if (result[0].percentbuysell) {
        sell=(result[0].percentbuysell.sell);
        buy=(result[0].percentbuysell.buy);
      }
      let valore={percentbuysell:{sell:sell+1,buy:buy}}
      dbo.collection("calcio").updateOne({_id:new ObjectId(i.id)},{$set:valore},(err,result)=>{
        if (err) throw err;
      })
    });
  });
})
app.put("/fitcompiler", async (req,res)=>{
  let i=JSON.parse(Object.keys(req.body)[0])
  let valore={ nomeEsercizio:i.nomeEsercizio,scopo:i.scopo,aChi:i.aChi,muscoli:i.muscoli,ripetizioni:i.ripetizioni,pausa:i.pausa,foto:i.foto,video:i.video}
  //aggiunge a valoreSell le specifiche di chi vende l'azione, quante azioni vende e a che prezzo
  MongoClient.connect("mongodb+srv://apo:jac2001min@cluster0.pdunp.mongodb.net/player?retryWrites=true&w=majority", function(err, db) {
    if (err) throw err;
    var dbo = db.db("player");
    dbo.collection("fit").insertOne(valore,(err,result)=>{
      if (err) throw err;
      res.send(result)
      db.close()
    })
  });
})
app.get("/fit", async (req,res)=>{
  MongoClient.connect("mongodb+srv://apo:jac2001min@cluster0.pdunp.mongodb.net/player?retryWrites=true&w=majority", function(err, db) {
      if (err) throw err;
      var dbo = db.db("player");
      dbo.collection("fit").find({}).toArray(function(err, result) {
        if (err) throw err;
        res.send(result)
      });
  });
})



//mysql
/*
import mysql from "mysql2"

const pool=mysql.createPool({
    host:"127.0.0.1",
    user:"root",
    password:"jac2001min",
    database:"scoutingApp",
})
app.get("/",(req,res)=>{
    res.send("run")
})
app.get("/calcio",async(req,res)=>{
    pool.getConnection((err,conn)=>{
    if(err)throw err
    try{
        const qry="SELECT * FROM calcio"
        conn.query(qry,(err,result)=>{
        conn.release()
        if(err)throw err
        console.log(result);
        res.send(JSON.stringify(result))
    })
    }catch (err){
        console.log(err)
        res.end()
    }
    
})
})
*/

