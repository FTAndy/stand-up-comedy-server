const Nightmare = require('nightmare');
const cheerio = require('cheerio')

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
    // show: true
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
    .then((res) => {
      console.log('get images')
      const $ = cheerio.load(res)
      return $('.rg_di').slice(5, 8).toArray().map((div) => {
        // console.log(div.children[0].children[0].attribs.src)
        return div.children[0].children[0].attribs.src
      })
    })
};
