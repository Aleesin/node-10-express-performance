const { Router } = require("express");
const fetch = require("node-fetch");
const request = require("request");
const JSONStream = require("JSONStream");
const fs = require("fs");
const util = require("util");

const largeJsonUrl =
  "https://s3.amazonaws.com/philadelphia-parking-violations-raw-data/parking_violations_2017.json";
const smallJsonUrl =
  "https://s3.amazonaws.com/the-art-of-the-take/0002-Art-Of-The-Take.json";

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
    this.router.get("/data/large/stream/:zipcode", (req, response, next) => {
      const zipcode = req.params.zipcode;
      response.header("Content-Type", "application/json");
      request(largeJsonUrl)
        .pipe(
          JSONStream.parse("rows.*", item => {
            return item.zip_code === zipcode ? item : null;
          })
        )
        .pipe(JSONStream.stringify())
        .pipe(response);
    });

    this.router.get(
      "/data/large/promise/:zipcode",
      async (request, response, next) => {
        try {
          const zipcode = request.params.zipcode;
          const res = await fetch(largeJsonUrl);
          const json = await res.json();
          const filteredResults = json.rows.filter(obj => {
            return obj.zip_code === zipcode;
          });
          response.json(filteredResults);
        } catch (e) {
          next(e);
        }
      }
    );

    this.router.get(
      "/data/small/net/stream/:speaker",
      (req, response, next) => {
        const speaker = req.params.speaker;
        response.header("Content-Type", "application/json");
        request(smallJsonUrl)
          .pipe(
            JSONStream.parse("results.speaker_labels.segments.*", item => {
              return item.speaker_label === speaker ? item : null;
            })
          )
          .pipe(JSONStream.stringify())
          .pipe(response);
      }
    );

    this.router.get(
      "/data/small/net/promise/:speaker",
      async (request, response, next) => {
        try {
          const speaker = request.params.speaker;
          const res = await fetch(smallJsonUrl);
          const json = await res.json();
          const filteredResults = json.results.speaker_labels.segments.filter(
            obj => {
              return obj.speaker_label === speaker;
            }
          );
          response.json(filteredResults);
        } catch (e) {
          next(e);
        }
      }
    );

    this.router.get(
      "/data/small/disk/stream/:speaker",
      (req, response, next) => {
        const speaker = req.params.speaker;
        response.header("Content-Type", "application/json");

        const readStream = fs.createReadStream(
          __dirname + "/../../data/0002-Art-Of-The-Take.json"
        );
        readStream
          .pipe(
            JSONStream.parse("results.speaker_labels.segments.*", item => {
              return item.speaker_label === speaker ? item : null;
            })
          )
          .pipe(JSONStream.stringify())
          .pipe(response);
      }
    );

    this.router.get(
      "/data/small/disk/promise/:speaker",
      async (request, response, next) => {
        try {
          const speaker = request.params.speaker;
          const readFilePromise = util.promisify(fs.readFile);
          const jsonData = await readFilePromise(
            __dirname + "/../../data/0002-Art-Of-The-Take.json",
            { encoding: "utf-8" }
          );
          const json = JSON.parse(jsonData);
          const filteredResults = json.results.speaker_labels.segments.filter(
            obj => {
              return obj.speaker_label === speaker;
            }
          );
          response.json(filteredResults);
        } catch (e) {
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
