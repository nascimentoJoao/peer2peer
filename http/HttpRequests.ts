const http = require('http')

exports.post = (options, requestBody) => new Promise((resolve, reject) => {

    const data = JSON.stringify(requestBody);

    const req = http.request(options, res => {
        console.log(`statusCode: ${res.statusCode}`);

        res.on('data', data => {
            process.stdout.write(data);
        })
    })

    req.on('error', error => {
        console.log(error);
    })

    req.write(data);
    req.end();
});

exports.get = (options, requestBody) => new Promise((resolve, reject) => {

    const req = http.request(options, res => {
        res.on('data', d => {
            process.stdout.write(d);
        })
    })

    req.on('error', error => {
        console.log('error ', error);
    })

    req.end();
})