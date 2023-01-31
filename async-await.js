const download = require('images-downloader').images;
const fs = require("fs");
const archiver = require("archiver");

async function zipCatPics(url){
  const START = new Date().getTime();
  const COUNT_OF_PICS = 2;

  let buffs = [];
  for(let i = 0; i < COUNT_OF_PICS; i++){
    let name = await getNameOfPic(url);
    let buff = await createBuffer(name);
    buffs.push(buff);
  }

  await createZip(buffs);
  stopTime(START);
}

async function getNameOfPic(url){
  try {
    const dest = './';
    const a = await download([url], dest);
    if(!a[0].filename){
      throw new Error("Server does not answer");
    }
    return a[0].filename;
  } catch(e) {
    throw new Error(e);
  }
}

async function createBuffer(name){
  try {
    const file = await fs.promises.readFile(name);
    return file;
  } catch(e) {
    console.error("createBuffer caught error", e);
    throw new Error("createBuffer caught error", e);
  }
}

async function createZip(buffs){
  try{
    const output = fs.createWriteStream("./cats3.zip");
    const archive = archiver("zip");
    archive.append(JSON.stringify(buffs[0]), {name: "pic.txt"});
    archive.append(JSON.stringify(buffs[1]), {name: "pic2.txt"});
    archive.finalize();
    archive.pipe(output);
    output.on("end", () => {});
    output.on('close', () => {});
  } catch(e) {
    console.error("createZip caught error", e);
    throw new Error(e);
  }
  
}

function stopTime(start){
  const END = new Date().getTime();
  let timeOfProcess = END - start;
  console.log("Process took:", timeOfProcess);
}

zipCatPics("https://cataas.com/cat");