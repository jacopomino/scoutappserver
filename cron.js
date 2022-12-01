import { MongoClient} from "mongodb"
import {CronJob} from "cron"
import {spawn} from "child_process"

/*
import axios from "axios"
import cheerio from 'cheerio'

const getLinkCampionati = async () => {
	try {
		const { data } = await axios.get(
			'https://www.transfermarkt.com/wettbewerbe/europa/wettbewerbe'
		);
		const $ = cheerio.load(data);
		$('.inline-table > tbody > tr > td > a').each((n,item)=>{
      if(item.attribs.href.endsWith("/GB1") || item.attribs.href.endsWith("/ES1") || item.attribs.href.endsWith("/IT1") || item.attribs.href.endsWith("/L1") || item.attribs.href.endsWith("/FR1")){
        let linkCampionati=("https://www.transfermarkt.it"+item.attribs.href);
        getLinkSquadre(linkCampionati)
      }
		});
    return 0
	} catch (error) {
		throw error;
	}
};
const getLinkSquadre = async (link) => {
	try {
		const { data } = await axios.get(link);
		const $ = cheerio.load(data);
    let array=[]
		$('.items > tbody > tr > td > a').each((n,item)=>{
      if(item.attribs.href.includes("startseite") && !item.attribs.href.includes("#")){
        let count=0
        for(let e in array){
          if(array[e]===item.attribs.href){
            count++
          }
        }
        if(count===0){
          array.push(item.attribs.href)
          getLinkGiocatori("https://www.transfermarkt.it"+item.attribs.href)
        }
      }
		});
	} catch (error) {
		throw error;
	}
};
let linkGiocatoriArray=[]
const getLinkGiocatori = async (link) => {
	try {
		const { data } = await axios.get(link);
		const $ = cheerio.load(data);
		$('.items > tbody > tr > .posrela > .inline-table > tbody > tr > .hauptlink > .di.nowrap > .hide-for-small > a').each((n,item)=>{
      let linkGiocatori="https://www.transfermarkt.it"+item.attribs.href
      linkGiocatoriArray.push(linkGiocatori)
		});
	} catch (error) {
		throw error;
	}
};

const getInfokGiocatori = async () => {
  for(let e in linkGiocatoriArray){
    let objInfoIniziali={}
    let nome
    let club
    let logo
    let valore
    let objInfoFinali={}
    try {
      const { data } = await axios.get(linkGiocatoriArray[e]);
      const  $= cheerio.load(data);
      nome=($('.data-header__headline-wrapper > strong').text())
      $('.data-header__label').each((n,item)=>{
        objInfoIniziali[$(item).text().split(":")[0].trim()]=$(item).text().split(":")[1].trim()
      })
      console.log(nome);
      objInfoIniziali["Lega"]=$('.data-header__league').text()
      club=$('.data-header__club').text()
      logo=$('.data-header__box__club-link > img').attr("srcset")
      valore=$('.data-header__market-value-wrapper').text().split("€")[0]+"€"
      let arr=[]
      let arr1=[]
      $('.info-table.info-table--right-space > .info-table__content.info-table__content--regular').each((n,item)=>{
        arr[n]=$(item).text().trim();
      })
      $('.info-table.info-table--right-space > .info-table__content.info-table__content--bold').each((n,item)=>{
        arr1[n]=$(item).text().trim();
      })
      for(let i=0;i<arr.length;i++){
        objInfoFinali[arr[i]]=arr1[i]
      }
      $('.content-link').each((n,item)=>{
        if($(item).text().includes("Rendimento dettagliato")){
          getRendimentoGiocatori("https://www.transfermarkt.it"+item.attribs.href,nome)
        }
      })
    } catch (error) {
      throw error; 
    }
  }
};
const getRendimentoGiocatori = async (link,nome) => {
  let objRendimento={}
	try {
		const { data } = await axios.get(link);
		const $ = cheerio.load(data);
    let arr=[]
    let arr1=[]
    $('.items > thead > tr > .zentriert > a > span').each((n,item)=>{
      arr[n]=($(item).attr("title"));
		});
		$('.items > tfoot > tr > .zentriert').each((n,item)=>{
      arr1[n]=($(item).text());
		});
    $('.items > thead > tr > .rechts > a > span').each((n,item)=>{
      arr.push($(item).attr("title"));
		});
		$('.items > tfoot > tr > .rechts').each((n,item)=>{
      if(!$(item).text().includes("Totale")){
        arr1.push($(item).text());
      }
		});
    for(let i=0;i<arr.length;i++){
      objRendimento[arr[i]]=arr1[i]
    }
	} catch (error) {
		throw error;
	}
};
getLinkCampionati()
setTimeout(getInfokGiocatori,20000)*/

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

  
  