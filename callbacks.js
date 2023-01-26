const fs = require("fs");
const archiver = require("archiver");
const request = require("request");
const { randomInt } = require("crypto");

let start = null;
let end = null;

function getCatPics(url, callback) {
  start = new Date().getTime();
  let names = [];

  for (let i = 0; i < 2; i++) {
    let name = `${randomInt(1, 100)}.png`;

    request(url, { encoding: "binary" }, function (err, res, body) {
      if (err) {
        console.error("request err server does not answer", err);
      }
      fs.writeFile(name, body, "binary", function (err) {
        if (err) {
          console.error("writeFile err", err);
        }

        names.push(name);
        if (names.length > 1) {
          callback(names, makeZip);
        }
      });
    });
    
    if(i > 1){
      return;
    }
  }
}

function readFiles(names, callback) {
  let files = [];

  for (let i = 0; i < names.length; i++) {
    fs.readFile(`./${names[i]}`, (err, data) => {
      files.push(data);

      if (err) {
        console.error("readFile err", err);
      } else if (files.length > 1) {
        callback(files);
      }
    });
  }
}

function makeZip(pics) {
  const archive = archiver("zip");

  archive.append(JSON.stringify(pics[0]), { name: "pic.txt" });
  archive.append(JSON.stringify(pics[1]), { name: "pic2.txt" });

  archive.on("error", function (err) {
    console.error("archive err", err);
  });

  archive.finalize();
  archive.pipe(
    fs.createWriteStream("cats.zip", "", (err) => {
      console.error("createWriteStream err", err);
    })
  );

  end = new Date().getTime();
  let timeOfProcess = end - start;
  console.log("Process took:", timeOfProcess);
}

getCatPics("https://cataas.com/cat", readFiles);
