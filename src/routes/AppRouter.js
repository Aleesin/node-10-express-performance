const {Router} = require("express");
const JSONStream = require("JSONStream");
const fs = require("fs");
const util = require("util");
const pump = require("pump");

const readFilePromise = util.promisify(fs.readFile);

const largeFile = __dirname + "/../../data/phila_parking_violations_2017.json";
const smallFile = __dirname + "/../../data/0002-Art-Of-The-Take.json";

class AppRouter {
  constructor() {
    this.router = Router();
    this.base();
    this.data();
    this.proxy();
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
        const parseJson = JSONStream.parse("rows.*", item => {
          return item.zip_code === zipcode ? item : null;
        });
        pump(readStream, parseJson, JSONStream.stringify(), response, error => {
          if (error) {
            if (error.code === "ENOENT") {
              this.handleLargeFileError();
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
          const json = await this.readFile(largeFile);
          const filteredResults = json.rows.filter(obj => {
            return obj.zip_code === zipcode;
          });
          response.json(filteredResults);
        } catch (error) {
          if (error.code === "ENOENT") {
            this.handleLargeFileError();
          }
        }
      }
    );

    this.router.get("/data/small/stream/:speaker", (req, response, next) => {
      const speaker = req.params.speaker;
      const readStream = fs.createReadStream(smallFile);
      const parseSpeakers = speaker =>
        JSONStream.parse("results.speaker_labels.segments.*", item => {
          return item.speaker_label === speaker ? item : null;
        });

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
          const json = await this.readFile(smallFile);
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
  proxy() {
    this.router.get("/proxy/:size/stream/", (request, response, next) => {
      const dataSet = this.datasetFromURLParam(request.params.size);
      const readStream = fs.createReadStream(dataSet);
      pump(readStream, response, error => {
        if (error) {
          if (error.code === "ENOENT") {
            this.handleLargeFileError();
          }
          next(error);
        }
      });
    });

    this.router.get(
      "/proxy/:size/promise/",
      async (request, response, next) => {
        try {
          const dataSet = this.datasetFromURLParam(request.params.size);
          const json = await this.readFile(dataSet);
          response.json(json);
        } catch (error) {
          if (error.code === "ENOENT") {
            this.handleLargeFileError();
          }
        }
      }
    );
  }

  async readFile(file) {
    try {
      const jsonData = await readFilePromise(file);
      const json = JSON.parse(jsonData);
      return json;
    } catch (e) {
      throw e;
    }
  }

  datasetFromURLParam(param) {
    return param === "large" ? largeFile : smallFile;
  }

  handleLargeFileError() {
    console.error("Large data file does not exist");
    console.error("Try running `node bin/download-large-data`");
    process.exit(-2);
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
