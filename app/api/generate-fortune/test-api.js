const http = require('http');

const data = JSON.stringify({
    name: "Tester",
    birthYear: "1990",
    birthMonth: "4",
    birthDay: "15"
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/generate-fortune',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, res => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => console.log(body));
});

req.on('error', error => console.error(error));
req.write(data);
req.end();
