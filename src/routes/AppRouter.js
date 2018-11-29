const {Router} = require("express");
const JSONStream = require("JSONStream");
const fs = require("fs");
const util = require("util");
const pump = require("pump");

const parseSpeakers = speaker =>
  JSONStream.parse("results.speaker_labels.segments.*", item => {
    return item.speaker_label === speaker ? item : null;
  });

const readFilePromise = util.promisify(fs.readFile);

const largeFile = __dirname + "/../../data/phila_parking_violations_2017.json";
const smallData = __dirname + "../../data/0002-Art-Of-The-Take.json";

class AppRouter {
  constructor() {
    this.router = Router();
    this.base();
    this.data();
  }

  base() {
    this.router.get("/", (request, response, next) => {
      response.json({
        pid: process.pid,
        uptime: this.format(process.uptime())
      });
    });
  }

  data() {
    this.router.get(
      "/data/large/stream/:zipcode",
      (request, response, next) => {
        const zipcode = request.params.zipcode;
        const readStream = fs.createReadStream(largeFile);
        // const parse = JSONStream.parse("rows.*", item => {
        //   return item.zip_code === zipcode ? item : null;
        // });
        pump(readStream, response, error => {
          if (error) {
            if (error.code === "ENOENT") {
              console.error("Large data file does not exist");
              console.error("Try running `node bin/download-large-data`");
              process.exit(-2);
            }
            next(error);
          }
        });
      }
    );

    this.router.get(
      "/data/large/promise/:zipcode",
      async (request, response, next) => {
        const zipcode = request.params.zipcode;
        try {
          const jsonData = await readFilePromise(largeFile);
          const json = JSON.parse(jsonData);
          const filteredResults = json.rows.filter(obj => {
            return obj.zip_code === zipcode;
          });
          response.json(filteredResults);
        } catch (error) {
          if (error.code === "ENOENT") {
            console.error("Large data file does not exist");
            console.error("Try running `node bin/download-large-data`");
            process.exit(-2);
          }
        }
      }
    );

    this.router.get("/data/small/stream/:speaker", (req, response, next) => {
      const speaker = req.params.speaker;
      const readStream = fs.createReadStream(smallData);
      pump(
        readStream,
        parseSpeakers(speaker),
        JSONStream.stringify(),
        response,
        error => {
          if (error) {
            return next(error);
          }
        }
      );
    });

    this.router.get(
      "/data/small/promise/:speaker",
      async (request, response, next) => {
        try {
          const speaker = request.params.speaker;
          const jsonData = await readFilePromise(smallData, {
            encoding: "utf-8"
          });
          const json = JSON.parse(jsonData);
          const filteredResults = json.results.speaker_labels.segments.filter(
            obj => {
              return obj.speaker_label === speaker;
            }
          );
          response.json(filteredResults);
        } catch (e) {
          e.status = 503;
          next(e);
        }
      }
    );
  }

  format(uptime) {
    const pad = s => (s < 10 ? "0" : "") + s;
    const hours = Math.floor(uptime / (60 * 60));
    const minutes = Math.floor((uptime % (60 * 60)) / 60);
    const seconds = Math.floor(uptime % 60);

    return pad(hours) + ":" + pad(minutes) + ":" + pad(seconds);
  }
}

module.exports = AppRouter;
