# Node 10 Performance Benchmarks

Benchmarking performance metrics with [Express.js](https://github.com/expressjs/express) in Node.js version 10

Benchmarks are measured with [wrk](https://github.com/wg/wrk).

## Overview

There are six GET endpoints. All endpoints pull from a JSON source, filter the JSON by a parameter in the endpoint, and return the resulting set.

Each end point has a `stream` version and `promise` version.

## Endpoints

- `/data/small/net/stream/:speakerId`

  Retrieves JSON data over the network via stream and `pipe`s to client, filtered by `speakerId`

- `/data/small/disk/promise/:speakerId`

  Retrieves JSON data over the network via a Promise, then sends to client, filtered by `speakerId`

- `/data/small/disk/stream/:speakerId`

  Retrieves JSON data from disk via stream and `pipe`s to client, filtered by `speakerId`

- `/data/small/disk/promise/:speakerId`

  Retrieves JSON data from disk via a Promise, then sends to client, filtered by `speakerId`

- `/data/large/stream/:zipcode`

  Retrieves 2~ GB JSON dataset over the network via stream and `pipe`s to client, filtered by `zipcode`

- `/data/large/promise/:zipcode`

  Retrieves 2~ GB JSON dataset over the network via a Promise,then sends to client, filtered by `zipcode`

# Benchmark Results

## Small JSON Over Network

### Stream:

`wrk -t12 -c400 -d45s http://localhost:3000/data/small/net/stream/spk_1`

```
Running 45s test @ http://localhost:3000/data/small/net/stream/spk_1
  12 threads and 400 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency     0.00us    0.00us   0.00us     nan%
    Req/Sec     3.93      5.09    30.00     86.72%
  291 requests in 45.07s, 100.25MB read
  Socket errors: connect 0, read 125, write 0, timeout 291
Requests/sec:      6.46
Transfer/sec:      2.22MB
```

### Promises:

`wrk -t12 -c400 -d45s http://localhost:3000/data/small/net/promise/spk_1`

```
Running 45s test @ http://localhost:3000/data/small/net/promise/spk_1
  12 threads and 400 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency     0.00us    0.00us   0.00us     nan%
    Req/Sec     1.54      2.91    19.00     90.38%
  243 requests in 45.09s, 57.32MB read
  Socket errors: connect 0, read 483, write 0, timeout 243
Requests/sec:      5.39
Transfer/sec:      1.27MB
```

## Small JSON On Disk

### Stream

`wrk -t12 -c400 -d45s http://localhost:3000/data/small/disk/stream/spk_1`

```
Running 45s test @ http://localhost:3000/data/small/disk/stream/spk_1
  12 threads and 400 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency     0.00us    0.00us   0.00us     nan%
    Req/Sec     6.57     25.10   126.00     92.86%
  316 requests in 45.10s, 116.97MB read
  Socket errors: connect 0, read 361, write 0, timeout 316
Requests/sec:      7.01
Transfer/sec:      2.59MB
```

**Memory Consumed:** `730 MB`

### Promises

`wrk -t12 -c400 -d45s http://localhost:3000/data/small/disk/promise/spk_1`

```
Running 45s test @ http://localhost:3000/data/small/disk/promise/spk_1
  12 threads and 400 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency     1.41s   328.43ms   1.98s    58.82%
    Req/Sec     5.45      5.20    30.00     82.42%
  1175 requests in 45.06s, 277.16MB read
  Socket errors: connect 0, read 400, write 0, timeout 1141
Requests/sec:     26.08
Transfer/sec:      6.15MB
```

**Memory Consumed:** `450 MB`

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
