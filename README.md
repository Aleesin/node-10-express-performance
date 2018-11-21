# Node 10 Performance Benchmarks

Benchmarking performance metrics with [Express.js](https://github.com/expressjs/express) in Node.js version 10

Benchmarks are measured with [wrk](https://github.com/wg/wrk).

## Overview

There are six GET endpoints. All endpoints pull from a JSON source, filter the JSON by a parameter in the endpoint, and return the resulting set.

Each end point has a `stream` version and `promise` version.

## Endpoints

- `/data/small/net/stream/:speakerId`

  _Retrieves JSON data over the network via stream and `pipe`s to client, filtered by `speakerId`_

- `/data/small/disk/promise/:speakerId`

  _Retrieves JSON data over the network via a Promise, then sends to client, filtered by `speakerId`_

- `/data/small/disk/stream/:speakerId`

  _Retrieves JSON data from disk via stream and `pipe`s to client, filtered by `speakerId`_

- `/data/small/disk/promise/:speakerId`

  _Retrieves JSON data from disk via a Promise, then sends to client, filtered by `speakerId`_

- `/data/large/stream/:zipcode`

  _Retrieves 2~ GB JSON dataset over the network via stream and `pipe`s to client, filtered by `zipcode`_

- `/data/large/promise/:zipcode`

  _Retrieves 2~ GB JSON dataset over the network via a Promise,then sends to client, filtered by `zipcode`_

# Benchmark Results

## Small JSON Over Network

### Stream:

`wrk -t12 -c200 -d60s http://localhost:3000/data/small/net/stream/spk_1`

```
Running 1m test @ http://localhost:3000/data/small/net/stream/spk_1
  12 threads and 200 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency     0.00us    0.00us   0.00us     nan%
    Req/Sec     3.00      4.33    30.00     82.81%
  483 requests in 1.00m, 117.06MB read
  Socket errors: connect 0, read 116, write 0, timeout 483
Requests/sec:      8.04
Transfer/sec:      1.95MB
```

### Promises:

`wrk -t12 -c200 -d60s http://localhost:3000/data/small/net/promise/spk_1`

```
Running 1m test @ http://localhost:3000/data/small/net/promise/spk_1
  12 threads and 200 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency   993.92ms  323.81ms   1.50s    64.71%
    Req/Sec     3.81      4.32    40.00     79.53%
  1241 requests in 1.00m, 293.15MB read
  Socket errors: connect 0, read 133, write 0, timeout 1224
Requests/sec:     20.65
Transfer/sec:      4.88MB
```

## Small JSON On Disk

### Stream

`wrk -t12 -c200 -d60s http://localhost:3000/data/small/disk/stream/spk_1`

```
Running 1m test @ http://localhost:3000/data/small/disk/stream/spk_1
  12 threads and 200 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency     0.00us    0.00us   0.00us     nan%
    Req/Sec    10.67     26.31   130.00     85.71%
  429 requests in 1.00m, 135.70MB read
  Socket errors: connect 0, read 125, write 0, timeout 429
Requests/sec:      7.14
Transfer/sec:      2.26MB
```

### Promises

`wrk -t12 -c200 -d60s http://localhost:3000/data/small/disk/promise/spk_1`

```
Running 1m test @ http://localhost:3000/data/small/disk/promise/spk_1
  12 threads and 200 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency     1.54s   268.01ms   1.98s    60.00%
    Req/Sec     6.69      5.80    30.00     76.39%
  1533 requests in 1.00m, 361.61MB read
  Socket errors: connect 0, read 127, write 0, timeout 1503
Requests/sec:     25.51
Transfer/sec:      6.02MB
```

## Large JSON Over Network

### Stream

### Promises

# Running HTTP Server

There are two executables in the `bin` directory:

- `www` - runs the server in a [cluster](https://nodejs.org/api/cluster.html#cluster_cluster) of processes
- `www-single` - runs the server in a single process

# Documentation

There is a `.paw` and `postman.json` file to run example requests in the `docs` directory.

Routes are also defined in `/src/routes/AppRouter.js`
