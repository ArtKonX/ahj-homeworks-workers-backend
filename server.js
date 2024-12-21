const Koa = require('koa');
const KoaRouter = require('koa-router');
const koaSlow = require('koa-slow');
const { faker } = require('@faker-js/faker');
const http = require('http');

const createMovieNews = () => {
  return {
    id: faker.string.uuid(),
    title: faker.lorem.slug(),
    text: faker.lorem.lines(),
    imgSrc: faker.image.url(),
    received: Date.now()
  };
}

const generateRandomMovieNews = () => {
  return faker.helpers.multiple(createMovieNews, {
    count: 5,
  })
}

const router = new KoaRouter();

router.get('/movie-world-news', (ctx) => {
  const res = { status: 'ok', timestamp: Date.now(), news: generateRandomMovieNews() };

  ctx.response.body = JSON.stringify(res);
});

const app = new Koa();

app.use(koaSlow({ url: /movie-world-news$/i, delay: 5000 }));

app.use(async (ctx, next) => {
  const origin = ctx.request.get('Origin');
  if (!origin) {
    return await next();
  }

  const headers = { 'Access-Control-Allow-Origin': '*', };

  if (ctx.request.method !== 'OPTIONS') {
    ctx.response.set({...headers});
    try {
      return await next();
    } catch (e) {
      e.headers = {...e.headers, ...headers};
      throw e;
    }
  }

  if (ctx.request.get('Access-Control-Request-Method')) {
    ctx.response.set({
      ...headers,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
    });

    if (ctx.request.get('Access-Control-Request-Headers')) {
      ctx.response.set('Access-Control-Allow-Headers', ctx.request.get('Access-Control-Request-Headers'));
    }

    ctx.response.status = 204;
  }
});

app.use(router.routes()).use(router.allowedMethods());

const port = process.env.PORT || 7070;
const server = http.createServer(app.callback());

const startServer = () => {
  try {
    server.listen(port, () => {
      console.log(`Server has been started on http://localhost:${port}`);
    });
  }
  catch (error) {
    console.error(error);
  }
};

startServer();
