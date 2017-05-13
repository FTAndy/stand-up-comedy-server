const db = require('./db.js');
const cheerio = require('cheerio')
const fetch = require("node-fetch");

const comedians = [
  {
    name: 'Louis C.K.',
    website: 'https://louisck.net/',
    avatarUrl: "http://olrzfbqqd.bkt.clouddn.com/Louis-ck.jpg",
    country: 'USA',
    // specials: [{
    //   name: 'Hilarious',
    //   pictureUrls: [
    //     'http://1.images.comedycentral.com/images/ccstandup/massives/CCSU_LouisCK_1920x540.jpg?quality=0.85&width=1556&height=540&crop=true'
    //   ],
    //   date: new Date(2013, 1, 1),
    //   star: 10
    // }]
  },
  {
    name: 'George Carlin',
    website: 'https://georgecarlin.com/',
    country: 'USA',
    avatarUrl: "http://olrzfbqqd.bkt.clouddn.com/532f094553b367095a1cfad874b4ff2f.jpg",
  },
  {
    name: 'Doug Stanhope',
    website: 'https://www.dougstanhope.com',
    country: 'USA',
    avatarUrl: "http://olrzfbqqd.bkt.clouddn.com/httpbrasssolutions2-ru.jpg",
  }
]

function fetchWikiPromise() {
  return comedians.map((comedian) => {
    return comedian.name.replace(' ', '_')
  })
  .map((name) => {
    console.log(`fetching ${name} detail from wiki`)
    return fetch(`https://en.wikipedia.org/wiki/${name}`)
    .then(res => res.text())
  })
}

function fetchSpecialWiki(url) {
  return fetch(url)
  .then((res) => res.text())
  .then((specialData) => {
    const $ = cheerio.load(specialData)
    return $.html($('#mw-content-text').children('p').first())
  })
}

function comediansDataPromise() {
  return comedians.map((comedian) => {
    return db.Comedian.findOne({
      name: comedian.name
    })
    .exec()
    .then((data) => {
      if (data == null) {
        return db.Comedian.create(comedian)
      }
      return data.update(comedian)
    })
  })
}

Promise.all(fetchWikiPromise())
.then(async (comedianWiki) => {
  for (let wikiData of comedianWiki) {
    const index = comedianWiki.indexOf(wikiData)
    const comedian = comedians[index]
    const $ = cheerio.load(wikiData)
    const description = $.html($('.vcard').nextUntil('#toc').not('.vcard'))
    let specialsData = $('[id^="Discography"]').parent().next()

    switch (specialsData[0].name) {
      // https://en.wikipedia.org/wiki/Louis_C.K. style
      case 'ul':
        specialsData = $(specialsData).find('li').toArray()
        for (let li of specialsData) {
          const year = li.children[0].data.replace(':', '')
          const href = li.children[1].children[0]
          let specialDescription
          if (href.name === 'a') {
            const specialUrl = `https://en.wikipedia.org${href.attribs.href}`
            specialDescription = await fetchSpecialWiki(specialUrl)
          } else {
            specialDescription = 'no description'
          }
          let specialName = li.children[1].children[0].data
          if (!specialName) {
            specialName = li.children[1].children[0].children[0].data
          }
          const special = {
            year,
            name: specialName,
            description: specialDescription,
            pictureUrls: [
              'http://1.images.comedycentral.com/images/ccstandup/massives/CCSU_LouisCK_1920x540.jpg?quality=0.85&width=1556&height=540&crop=true'
            ],
            star: 10
          }
          comedian.specials ? comedian.specials.push(special) : comedian.specials = []
        }
        break;
      // https://en.wikipedia.org/wiki/George_Carlin style
      case 'dl':

        break;
      // https://en.wikipedia.org/wiki/Doug_Stanhope style
      case 'table':

        break;
      default:

    }
    comedian.description = description
  }
  return Promise.all(comediansDataPromise())
})
.then((datas) => {
  // console.log(datas, 'fuck');
  console.log('fetch finish')
  process.exit()
})
.catch((err) => {
  console.error(err);
})
