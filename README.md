# Node 10 Performance Benchmarks

Benchmarking performance metrics with Express.js in Node.js version 10

### Small JSON Stream (Over Network)

`wrk -t12 -c400 -d45s http://localhost:3000/data/small/net/stream/spk_1`

```
Running 45s test @ http://localhost:3000/data/small/net/stream/spk_1
  12 threads and 400 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency     0.00us    0.00us   0.00us     nan%
    Req/Sec     1.81      3.17    20.00     88.08%
  160 requests in 45.09s, 104.53MB read
  Socket errors: connect 0, read 305, write 4, timeout 160
Requests/sec:      3.55
Transfer/sec:      2.32MB
```

### Small JSON Promises (Over Network)

`wrk -t12 -c400 -d45s http://localhost:3000/data/small/net/promise/spk_1`

```
Running 45s test @ http://localhost:3000/data/small/net/promise/spk_1
  12 threads and 400 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency     0.00us    0.00us   0.00us     nan%
    Req/Sec     2.16      3.21    10.00     86.31%
  174 requests in 45.08s, 41.04MB read
  Socket errors: connect 0, read 251, write 0, timeout 174
Requests/sec:      3.86
Transfer/sec:      0.91MB
```

### Small JSON Stream (On Disk)

`wrk -t12 -c400 -d45s http://localhost:3000/data/small/stream/disk/spk_1`

```
Running 45s test @ http://localhost:3000/data/small/disk/stream/spk_1
  12 threads and 400 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency     0.00us    0.00us   0.00us     nan%
    Req/Sec    10.09      9.44    60.00     76.54%
  772 requests in 45.10s, 254.88MB read
  Socket errors: connect 0, read 33, write 11, timeout 772
Requests/sec:     17.12
Transfer/sec:      5.65MB
```

### Small JSON Promises (On Disk)

`wrk -t12 -c400 -d45s http://localhost:3000/data/small/disk/promise/spk_1`

```
Running 45s test @ http://localhost:3000/data/small/disk/promise/spk_1
  12 threads and 400 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency     1.25s   200.71ms   1.93s    81.95%
    Req/Sec     8.35      6.65    50.00     75.50%
  2806 requests in 45.11s, 661.88MB read
  Socket errors: connect 0, read 220, write 0, timeout 2396
Requests/sec:     62.21
Transfer/sec:     14.67MB
```

### Large JSON Stream

### Large JSON Promises
