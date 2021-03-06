const http = require('http')

exports.post = (options, requestBody) => new Promise((resolve, reject) => {
    const req = http.request(options, res => {

        let body = '';

        res.on('data', data => {
            body += data;
        });

        res.on('end', _ => {
            resolve(body);
        })
    })

    req.on('error', error => {
        console.log(`Erro tentando efetuar chamada POST!\n\n ${error}`);
        reject(error);
    })

    req.write(requestBody);
    req.end();
});

exports.get = (options, requestBody) => new Promise((resolve, reject) => {

    const req = http.request(options, res => {

        let body = '';

        res.on('data', chunk => {
            body += chunk;
        })

        res.on('end', _  => {
            resolve(body);
        })
    })

    req.on('error', error => {
        console.log(`Erro tentando efetuar chamada GET!\n\n ${error}`);
        reject(error);
    })

    req.end();
});

exports.put = (options, requestBody) => new Promise((resolve, reject) => {

    const req = http.request(options, res => {

        let body = '';

        res.on('data', data => {
            body += data;
        });

        res.on('end', _ => {
            resolve(body);
        })
    })

    req.on('error', error => {
        console.log(`Erro tentando efetuar chamada PUT!\n\n ${error}`);
        reject(error);
    })

    req.write(requestBody);
    req.end();
});

