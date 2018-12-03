# Node 10 Performance Benchmarks

Benchmarking stream perforamce with [Express.js](https://github.com/expressjs/express) on Node.js version 10

Benchmarks are measured with [wrk](https://github.com/wg/wrk).

## Overview

- `data` endpoints pull from a JSON file, filter the JSON by a parameter in the endpoint, and return the resulting set.

- `proxy` endpoints return the full JSON file.

- Each end point has a `stream` version and `promise` version.

- All endpoints are `GET`s.

- Routes are defined in [`/src/routes/AppRouter.js`](https://github.com/MattMorgis/node-10-express-performance/blob/master/src/routes/AppRouter.js)

## Endpoints

| Endpoint                    | File Size | Description                                                                   | Method                                               |
| --------------------------- | --------- | ----------------------------------------------------------------------------- | ---------------------------------------------------- |
| `/`                         |           | Returns `pid` and `uptime`                                                    |
| `/data/large/stream/19103`  | `200mb`   | Returns 2017 Philadelphia parking violations for specificed zipcode.          | Uses `createReadStream` and `JSONStream`             |
| `/data/large/promise/19103` | `200mb`   | Returns 2017 Philadelphia parking violations for specificed zipcode.          | Uses `fs.readFile` and `JSON.parse()` and `filter()` |
| `/data/small/stream/spk_1`  | `4mb`     | Returns all of the segments for specified speaker from podcast transcription. | Uses `createReadStream` and `JSONStream`             |
| `/data/small/promise/spk_1` | `4mb`     | Returns all of the segments for specified speaker from podcast transcription. | Uses `fs.readFile` and `JSON.parse()` and `filter()` |
| `/proxy/large/stream/`      | `200mb`   | Returns 2017 Philadelphia parking violations.                                 | Uses `createReadStream`                              |
| `/proxy/large/promise/`     | `200mb`   | Returns 2017 Philadelphia parking violations.                                 | Uses `fs.readFile`                                   |
| `/proxy/small/stream/`      | `4mb`     | Returns all of the segments for all speakers from podcast transcription.      | Uses `createReadStream`                              |
| `/proxy/small/promise/`     | `4mb`     | Returns all of the segments for all speakers from podcast transcription.      | Uses `fs.readFile`                                   |

## Running HTTP Server

There are three executables in the `bin` directory:

- `www-cluster` - runs the server in a [cluster](https://nodejs.org/api/cluster.html#cluster_cluster) of processes
- `www-single` - runs the server in a single process. `node-clinic` needs the server to run in a single process.
- `download-large-data` - Downloads dataset that was too large to check into git.

```
$ npm i
```

```
$ node bin/download-large-data
```

```
$ npm start
```

There is a `.paw` and `postman.json` file to run example requests in the `docs` directory.

## Running with node-clinic

[`node-clinic`](https://github.com/nearform/node-clinic) was used to watch CPU and memory usage, along with other metrics, during benchmarking.

Install with

```
npm install -g clinic
```

Have `clinic` run and monitor our server

```
clinic doctor -- node bin/www-single
```

Then run one of the following benchmark commands below.
