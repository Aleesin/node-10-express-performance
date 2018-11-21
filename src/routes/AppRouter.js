const {Router} = require("express");
const fetch = require("node-fetch");
const JSONStream = require("JSONStream");
const fs = require("fs");
const util = require("util");
const pump = require("pump");

const largeJsonUrl =
  "https://s3.amazonaws.com/philadelphia-parking-violations-raw-data/parking_violations_2017.json";
const smallJsonUrl =
  "https://s3.amazonaws.com/the-art-of-the-take/0002-Art-Of-The-Take.json";

const parseSpeakers = speaker =>
  JSONStream.parse("results.speaker_labels.segments.*", item => {
    return item.speaker_label === speaker ? item : null;
  });

const readFilePromise = util.promisify(fs.readFile);

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
        fetch(largeJsonUrl)
          .then(res => {
            const parse = JSONStream.parse("rows.*", item => {
              return item.zip_code === zipcode ? item : null;
            });
            pump(res.body, parse, JSONStream.stringify(), response, error => {
              if (error) {
                return next(error);
              }
            });
          })
          .catch(e => {
            e.status = 503;
            return next(e);
          });
      }
    );

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
          return next(e);
        }
      }
    );

    this.router.get(
      "/data/small/net/stream/:speaker",
      (request, response, next) => {
        const speaker = request.params.speaker;
        fetch(smallJsonUrl)
          .then(res => {
            pump(
              res.body,
              parseSpeakers(speaker),
              JSONStream.stringify(),
              response,
              error => {
                if (error) {
                  return next(error);
                }
              }
            );
          })
          .catch(e => {
            e.status = 503;
            return next(e);
          });
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
          e.status = 503;
          return next(e);
        }
      }
    );

    this.router.get(
      "/data/small/disk/stream/:speaker",
      (req, response, next) => {
        const speaker = req.params.speaker;
        const readStream = fs.createReadStream(
          __dirname + "/../../data/0002-Art-Of-The-Take.json"
        );
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
      }
    );

    this.router.get(
      "/data/small/disk/promise/:speaker",
      async (request, response, next) => {
        try {
          const speaker = request.params.speaker;
          const jsonData = await readFilePromise(
            __dirname + "/../../data/0002-Art-Of-The-Take.json",
            {
              encoding: "utf-8"
            }
          );
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
