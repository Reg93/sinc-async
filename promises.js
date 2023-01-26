const fetch = require("node-fetch");
const fs = require("fs");
const fsPromises = require("fs").promises;
const archiver = require("archiver");
const { randomInt } = require("crypto");
const toBuffer = require("to-buffer");

let start = null;
let end = null;

function saveCatPics(url) {
  start = new Date().getTime();

  return new Promise((res, rej) => {
    let arr = [];

    for (let i = 0; i < 2; i++) {
      fetch(url).then((response) => {
        let name = `${randomInt(1, 100)}.png`;

        if (response.status === 200) {
          response.body.pipe(fs.createWriteStream(name));

          arr.push(name);

          if (arr.length > 1) {
            res(arr);
          } else {
            return;
          }
        } else {
          rej("Server doesn't answer");
        }
      });
    }
  });
}

saveCatPics("https://cataas.com/cat")
  .then((res) => {
    let buffs = [];
    for (let i = 0; i < res.length; i++) {
      fsPromises
        .readFile(res[i])
        .catch((err) => {
          console.error("readFile caught error", err);
        })
        .then((res) => {
          const buff = toBuffer(res);
          return buff;
        })
        .catch((err) => {
          console.error("toBuffer caught error", err);
        })
        .then(function (res) {
          buffs.push(res);

          if (buffs.length > 1) {
            console.log(buffs);
            const archive = archiver("zip");
            archive.append(JSON.stringify(buffs[0]), { name: "pic.txt" });
            archive.append(JSON.stringify(buffs[1]), { name: "pic1.txt" });
            archive.finalize();
            archive.pipe(fs.createWriteStream("./cats2.zip"));

            end = new Date().getTime();
            let timeOfProcess = end - start;
            console.log("Process took:", timeOfProcess);
          }
        })
        .catch((err) => {
          console.error("Archiver caught error", err);
        });
    }
  })
  .catch((err) => {
    console.error("Promise caught error", err);
  });
