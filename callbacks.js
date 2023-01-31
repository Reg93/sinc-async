const fs = require("fs");
const archiver = require("archiver");
const request = require("request");
const { randomInt } = require("crypto");

let start = null;
let end = null;

function zipCatPics(url, callback){
  start = new Date().getTime();
  let data = { url: url, names: [], pic: null, files: []};
  callback(data, catchErrorForRequest);
}

function getPic(data, callback) {
  request(data.url, { encoding: "binary" }, function (err, res, body) {
    let msg = null;

    if(res.statusCode !== 200){
      msg = "Server does not answer";
    } else if(err) {
      msg = "Request caught error" + err;
    }

    data.pic = body;
    callback(msg, data, writeFile);
  });
}

function catchErrorForRequest(msg, data, callback){
  if(msg){
    console.error(msg);
  } else {
    callback(data, catchErrorForWriteFile);
  }
}

function writeFile(data, callback){
  let name = `${randomInt(1, 100)}.png`;
  data.names.push(name);
  fs.writeFile(name, data.pic, "binary", (err) => {
    callback(err, data, readFiles);
  });
}

function catchErrorForWriteFile(err, data, callback){
  if(err){
    console.error("writeFile caught error", err);
  } else {
    callback(data, catchErrorForReadFiles);
  }
}

function readFiles(data, callback) {
  let name = null;
  if(data.names.length < 2){
    name = data.names[0];
  } else {
    name = data.names[1];
  }

  fs.readFile(`./${name}`, (err, res) => {
    data.files.push(res);
      callback(err, data, makeZip);
  });

}

function catchErrorForReadFiles(err, data, callback){
  if(err){
    console.error("readFile caught error", err);
  } else {
    callback(data, getPic, stopTime, cheackErrorForMakeZip);
  }
}

function makeZip(data, getPic, stopTime, callback) {
  if(data.files.length < 2){
    getPic(data, catchErrorForRequest);
  } else {
    let msg = null;
    const archive = archiver("zip");
    const output = fs.createWriteStream("cats.zip");

    archive.append(JSON.stringify(data.files[0]), { name: "pic.txt" });
    archive.append(JSON.stringify(data.files[1]), { name: "pic2.txt" });

    archive.on("error", (err) => {
      msg = "archive error";
      callback(err, msg);
    });
    archive.on("warning", (err) => {
      msg = "archive warning";
      callback(err, msg);
    });

    archive.finalize();
    archive.pipe(output);
    output.on("error", () => {
      msg = "createWriteStream error";
      callback(err, msg);
    })
    output.on('end', () => {});
    output.on('close', () => {stopTime()});
  }
}

function cheackErrorForMakeZip(err, msg){
  if(err){
    console.error(msg, err);
  }
}

function stopTime(){
  end = new Date().getTime();
  let timeOfProcess = end - start;
  console.log("Process took:", timeOfProcess);
}

zipCatPics("https://cataas.com/cat", getPic);
