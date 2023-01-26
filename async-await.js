const download = require('images-downloader').images;
const fs = require("fs");
const archiver = require("archiver");

async function zipCatPics(url){
  let start = new Date().getTime();

  let buffs = [];
  for(let i = 0; i < 2; i++){
    let name = await getNameOfPic(url);
    let buff = await createBuffer(name);
    buffs.push(buff);
    if(buff.length === 2){
      return;
    }
  }

  await createZip(buffs);

  let end = new Date().getTime();
  let timeOfProcess = end - start;
  console.log("Process took:", timeOfProcess);
}

async function getNameOfPic(url){
  try {
    const dest = './';
    const a = await download([url], dest);
    return a[0].filename;
  } catch(e) {
    console.error("getNameOfPic caught error", e);
  }
}

async function createBuffer(name){
  try {
    const file = await fs.promises.readFile(name);
    return file;
  } catch(e) {
    console.error("createBuffer caught error", e);
  }
}

async function createZip(buffs){
  try{
    const archive = archiver("zip");
    archive.append(JSON.stringify(buffs[0]), {name: "pic.txt"});
    archive.append(JSON.stringify(buffs[1]), {name: "pic2.txt"});
    archive.finalize();
    archive.pipe(fs.createWriteStream("cats3.zip"));
  } catch(e) {
    console.error("Archiver caught error", e);
  }
  
}

zipCatPics("https://cataas.com/cat");