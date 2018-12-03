# Node 10 Performance Benchmarks

Benchmarking stream perforamce with [Express.js](https://github.com/expressjs/express) on Node.js version 10

Benchmarks are measured with [wrk](https://github.com/wg/wrk).

## Overview

`data` endpoints pull from a JSON file, filter the JSON by a parameter in the endpoint, and return the resulting set.

`proxy` endpoints return the full JSON file.

Each end point has a `stream` version and `promise` version.

All endpoints are `GET`s.

## Endpoints

| Endpoint                    | Description                                                                                                                                                 |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                         | Returns `pid` and `uptime`                                                                                                                                  |
| `/data/large/stream/19103`  | Uses `200mb` `.json` file. Returns 2017 Philadelphia parking violations for specificed zipcode. Uses `createReadStream` and `JSONStream`                    |
| `/data/large/promise/19103` | Uses `200mb` `.json` file. Returns 2017 Philadelphia parking violations for specificed zipcode. Uses `fs.readFile` and `JSON.parse()` and `filter()`        |
| `/data/small/stream/spk_1`  | Uses `4mb` `.json` file. Returns all of the segments for specified speaker from podcast transcription. Uses `createReadStream` and `JSONStream`             |
| `/data/small/promise/spk_1` | Uses `4mb` `.json` file. Returns all of the segments for specified speaker from podcast transcription. Uses `fs.readFile` and `JSON.parse()` and `filter()` |
| `/proxy/large/stream/`      | Uses `200mb` `.json` file. Returns 2017 Philadelphia parking violations Uses `createReadStream`                                                             |
| `/proxy/large/promise/`     | Uses `200mb` `.json` file. Returns 2017 Philadelphia parking violations Uses `fs.readFile`                                                                  |
| `/proxy/small/stream/`      | Uses `4mb` `.json` file. Returns all of the segments for all speakers from podcast transcription. Uses `createReadStream`                                   |
| `/proxy/small/promise/`     | Uses `4mb` `.json` file. Returns all of the segments for all speakers from podcast transcription. Uses `fs.readFile`                                        |

# Running HTTP Server

There are three executables in the `bin` directory:

- `www` - runs the server in a [cluster](https://nodejs.org/api/cluster.html#cluster_cluster) of processes
- `www-single` - runs the server in a single process
- `download-large-data` - Downloads dataset that was too large to check into git.

```
$ npm i
```

```
$ node bin/download-large-data
```

```
$ node bin/wwww
```

# Documentation

There is a `.paw` and `postman.json` file to run example requests in the `docs` directory.

Routes are also defined in `/src/routes/AppRouter.js`

```

```
