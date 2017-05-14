const googleRequest = require('./fetch-imges.js')
const cheerio = require('cheerio')

googleRequest(`louis ck`)
.then((res) => {
  console.log(res)
})
