const Koa = require('koa');
const app = new Koa();
const db = require('./database/db.js');
const router = require('koa-router')();

app.use(async (ctx, next) => {
  ctx.response.set('Access-Control-Allow-Origin', '*')
  ctx.response.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  await next();
})

router.get('/comedians', async (ctx, next) => {
  try {
    const query = db.Comedian.find()
    const data = await query.exec()
    ctx.response.body = data
  } catch (e) {
    console.error(e);
  }
})

router.get('/comedian', '/comedian/:name', async (ctx, next) => {
  try {
    const query = db.Comedian.findOne({
      name: ctx.params.name || ""
    })
    const data = await query.exec()
    if (data === null) {
      ctx.response.body = 'fuck you'
    } else {
      ctx.response.body = data
    }
  } catch (e) {
    console.error(e);
  }
})

app.use(router.routes())

app.listen(3001)
