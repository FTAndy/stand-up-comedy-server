const Nightmare = require('nightmare');
const cheerio = require('cheerio')
const fs = require('fs')
const base64Img = require('base64-img')

let options

switch (process.env.NODE_ENV) {
  case 'production':
    options = {

    }
    break;
  case 'development':
    options = {
      switches: {
        'proxy-server': '127.0.0.1:1087' // set the proxy server here ...
      },
    }
    break;
  default:

}

module.exports = function googleRequest(keyword) {
  const proxyNightmare = Nightmare(Object.assign({
    // show: true,
    waitTimeout: 60000
  }, options));

  console.log('go to https://images.google.com/', keyword)
  return proxyNightmare
    .goto('https://images.google.com/')
    .type('#lst-ib', keyword)
    .click('#_fZl')
    .wait('#rg_s')
    .evaluate(function() {
      return document.querySelector('#rg_s').innerHTML
    })
    .end()
    .then(async (res) => {
      const $ = cheerio.load(res)
      const imagesBase64 = $('.rg_di').slice(5, 8).toArray()
      return Promise.all(imagesBase64.map((imageBase64, index) => {
        return new Promise((resolve, reject) => {
          const base64Data = imageBase64.children[0].children[0].attribs.src
          try {
            base64Img.img(base64Data, `tmp`, `/${keyword}-${index}`, function (err, filepath) {
              if (err) {
                resolve('')
                // reject()
              } else {
                resolve({
                  path: filepath,
                  name: `${keyword}-${index}.jpg`
                })
              }
            })
          } catch (e) {
            resolve('')
          }
        })
      }))
    })
};
