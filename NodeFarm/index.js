const fs = require('fs');
const http = require('http')
const url = require('url')
const slugify = require('slugify');

// SERVER
const replaceTemplate = (temp, product) => {
    let output = temp.replace(/{%PRODUCTNAME%}/g, product.productName)
    output = output.replace(/{%IMAGE%}/g, product.image)
    output = output.replace(/{%PRICE%}/g, product.price)
    output = output.replace(/{%COUNTRY%}/g, product.from)
    output = output.replace(/{%NUTRIENTS%}/g, product.nutrients)
    output = output.replace(/{%QUANTITY%}/g, product.quantity)
    output = output.replace(/{%DESCRIPTION%}/g, product.description)
    output = output.replace(/{%ID%}/g, product.id)

    if(!product.organic) output = output.replace(/{%NOTORGANIC%}/g, 'not-organic')
    return output;
}

const tempOverview = fs.readFileSync(`${__dirname}/templates/overview.html`, 'utf8');
const tempCard = fs.readFileSync(`${__dirname}/templates/card.html`, 'utf8')
const tempProduct = fs.readFileSync(`${__dirname}/templates/product.html`, 'utf8')

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`)
const dataObj = JSON.parse(data)

const slugs = dataObj.map(el => slugify(el.productName, { lower: true }))

console.log(slugs)

const server = http.createServer((req, res) => {

    const { query, pathname} = url.parse(req.url, true)

    // OVERVIEW
    if (pathname === '/' || pathname === '/overview') {
        res.writeHead(200, {'Content-Type': 'text/html'})

        const cardHtml = dataObj.map(d => replaceTemplate(tempCard, d)).join('')
        const output = tempOverview.replace('{%PRODUCTCARDS%}', cardHtml)

        res.end(output)

    // PRODUCT
    } else if (pathname === '/product') {
        res.writeHead(200, {'Content-Type': 'text/html'})

        const product = dataObj[query.id]
        const output = replaceTemplate(tempProduct, product)

        res.end(output)

    // API
    } else if (pathname === '/api') {
        res.writeHead(200, {'Content-Type': 'application/json'})
        res.end(data)

    // NOT FOUND
    } else {
        res.writeHead(404, {
            'Content-Type': 'text/html',
            'my-own-header': 'hello world'
        });
        res.end('<h1>not found</h1>') 
    }
})

server.listen(8000, '10.1.3.229', () => {
    console.log('Starting at 8000')
})
