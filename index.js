var http = require('http');

const getTokenID = (url) => {
    if(url=='/favicon.ico') return ''
    let ar = url.split('/')
    if(ar.length>2) return ''
    return(ar[1])
}

const pad = (s) => {while(s.length<64)s='0' + s;return s}

const getYieldMax = (data) => {
    let days = data.timeToPollination + data.pollinationWindow + data.maturationWindow/2;
    let yield = days * 1e16;
    return yield
}

const getYieldWithSeeds = (data) => {
    let yield = getYieldMax(data)
    let seedLoss = data.maxSeeds*1e14;
    if(seedLoss>=yield) return 0;
    return yield-seedLoss;
}

const parseTokenID = (tokenID) => {
    if(isNaN(tokenID)||tokenID=='') return {error: 'invalid tokenID'}
    let tid = BigInt(tokenID)
    let b = Buffer.from(pad(tid.toString(16)),'hex')
    let idx = b.readUInt32BE(24,4)
    let parentIdx = b.readUInt32BE(20,4)
    let timeToPollination = b.readUInt8(28)
    let pollinationWindow = b.readUInt8(29)
    let maturationWindow = b.readUInt8(30)
    let maxSeeds = b.readUInt8(31)
    let metadata = b.slice(0,20).toString('hex')
    let data = {idx,parentIdx,timeToPollination,pollinationWindow,maturationWindow,maxSeeds,metadata}
    data.maxYield = getYieldMax(data)
    data.seededYield = getYieldWithSeeds(data)
    return data
}

var server = http.createServer((req, res) => {
    var body = JSON.stringify(parseTokenID(getTokenID(req.url)),null,2)
    var content_length = body.length;
    res.writeHead(200, {
        'Content-Length': content_length,
        'Content-Type': 'application/json' });
 
    res.end(body);
});
server.listen(3939);
console.log('Server is running on port 3939');