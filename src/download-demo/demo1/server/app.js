/**
 * 服务入口
 */
var http = require('http');
var koaStatic = require('koa-static');
var path = require('path');
const extname = path.extname;
var koaBody = require('koa-body');
var fs = require('fs.promised');
const FS = require('fs')
var Koa = require('koa2');
const router = require('koa-router')()
const send = require('koa-send')

var app = new Koa();
var port = process.env.PORT || '8100';
// app.use(koaBody({
//     formidable: {
//         //设置文件的默认保存目录，不设置则保存在系统临时目录下  os
//         uploadDir: path.resolve(__dirname, '../static/uploads')
//     },
//     multipart: true // 支持文件上传
// }));
// router.get('/', (ctx) => {
//     // 设置头类型, 如果不设置，会直接下载该页面
//     ctx.type = 'html';
//     // 读取文件
//     const root = path.resolve(__dirname, '../static')
//     const pathUrl = '/html/download.html'
//     ctx.body = fs.createReadStream(pathUrl);
// })
// router.post('/download/:name', async (ctx) => {
//     console.log(ctx);
//     const name = ctx.params.name;
//     const root = path.resolve(__dirname, '../static')
//     const path = `${root}/downloads/${name}`
//     console.log(path)
//     ctx.attachment(path)
//     await send(ctx, path)
// })

//开启静态文件访问
app.use(koaStatic(
    path.resolve(__dirname, '../static')
));

//二次处理文件，修改名称
// const main = async function (ctx, next) {
//     console.log(ctx)
//     if (ctx.path === '/test') {
//         console.log(path.resolve(__dirname, '../static'))
//         const root = path.resolve(__dirname, '../static')
//         const filePath = path.join(root, '/downloads/test.txt')
//         ctx.response.body = await fs.readFile(filePath, 'utf8')
//     } else {
//         ctx.response.type = 'html';
//         ctx.response.body = await fs.readFile('./src/download-demo/demo1/server/download.html', 'utf8')
//     }

// }
app.use(async function (ctx) {
    console.log(ctx);
    const root = path.resolve(__dirname, '../static')
    const fpath = path.join(root, ctx.path);
    console.log(fpath);
    const fstat = await stat(fpath);
    if (ctx.path === '/html/download.html') {
        console.log('index');
        ctx.response.type = 'html';
        const r = path.resolve(__dirname, '../static')
        const p = path.join(r, '/html/download.html')
        ctx.response.body = await fs.readFile(p, 'utf8')
    } else if (fstat.isFile()) {
        console.log('downloadfile');
        ctx.set('Content-disposition', 'attachment')
        ctx.type = extname(fpath);
        console.log(ctx.type);
        if (ctx.type === 'text/plain') {
            ctx.body = FS.createReadStream(fpath, 'utf8')
        } else {
            ctx.response.type = ctx.type
            ctx.body = FS.createReadStream(fpath, 'base64')
        }
    }
})
// app.use(main);
function stat(file) {
    return new Promise(function (resolve, reject) {
        FS.stat(file, function (err, stat) {
            if (err) {
                reject(err);
            } else {
                resolve(stat);
            }
        });
    });
}

function readData(path) {
    return new Promise(function (resolve, reject) {
        FS.readFile(path, function (err, data) {
            if (err) {
                reject(err);//文件存在返回true
            } else {
                resolve(data);//文件不存在，这里会抛出异常
            }
        });
    }).then(function (data) {
        console.log(data);
        return data;
    }, function (err) {
        console.log(err);
        return err;
    })
}
// app.use(async (ctx) => {
//     if (ctx.path === '/download') {
//         console.log(ctx.request.url);
//         const root = path.resolve(__dirname, '../static')
//         console.log(__dirname)
//         console.log(root);
//         const filePath = `src/download-demo/demo1/static/downloads/test.txt`
//         ctx.attachment(filePath)
//         await send(ctx, filePath)
//     }
// })
// app.use(router.routes());
// app.use(router.allowedMethods())
// console.log(__dirname)
// console.log(path.resolve(__dirname, '../static'))

var server = http.createServer(app.callback());
server.listen(port);
console.log('demo1 server start ......   ');