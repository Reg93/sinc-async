const fetch = require("node-fetch");
const fs = require("fs");
const archiver = require("archiver");
const { randomInt } = require("crypto");

let start = null;
let end = null;

function zipCatPics(url){
  start = new Date().getTime();

  return new Promise((resolve, reject) => {
    if(url){
      resolve(url);
    } else {
      reject("zipCatPics error, no link!");
    }
  })
}

zipCatPics("https://cataas.com/cat")
  .then(res => {
    return new Promise((resolve, reject) => {
      Promise.all([getPic(res), getPic(res)])
      .then(res => {
        resolve(res)
      })
      .catch(err => {
        reject(err);
      })
    })
  })
  .catch(err => {
    console.error(err);
  })
  .then(res => {
    return new Promise((resolve, reject) => {
      Promise.all([readFile(res[0]), readFile(res[1])])
        .then(res => {
          resolve(res)
        })
        .catch(err => {
          reject(err);
        })
    })
  })
  .catch(err => {
    console.error(err);
  })
  .then(res => {
    const output = fs.createWriteStream("./cats2.zip");
    const archive = archiver("zip");
    archive.append(JSON.stringify(res[0]), { name: "pic.txt" });
    archive.append(JSON.stringify(res[1]), { name: "pic1.txt" });
    archive.finalize();
    archive.pipe(output);
    output.on("end", () => {});
    output.on('close', () => {});
  })
  .catch(err => {
    console.error("Archiver caught error", err);
  })
  .then(stopTime());



function getPic(url){
  let name = `${randomInt(1, 100)}.png`;

  return new Promise((resolve, reject) => {
    fetch(url).then(res => {

      if(res.status === 200){
        const stream = fs.createWriteStream(name);
        res.body.pipe(stream);
        stream.on("finish", () => {
        resolve(name);
        })
        stream.on("error", () => {
          reject("File was not written")
        })
      } else {
        reject("Server does not answer");
      }
    })
  })
}

function readFile(name){
  return new Promise((resolve, reject) => {
    fs.readFile(name, (err, data) => {
      if(err){
        reject("readFile caught error", err);
      } else {
        resolve(data);
      }
    })
  })
}

function stopTime(){
  end = new Date().getTime();
  let timeOfProcess = end - start;
  console.log("Process took:", timeOfProcess);
}
  