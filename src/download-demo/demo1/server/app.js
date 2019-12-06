/**
 * 服务入口
 */
var http = require('http');
const express = require('express')
var koaStatic = require('koa-static');
var path = require('path');
const extname = path.extname;
var koaBody = require('koa-body');
var fs = require('fs.promised');
const FS = require('fs')
var Koa = require('koa2');
const router = require('koa-router')()
const send = require('koa-send')
const xlsx = require('node-xlsx').default
var app = new Koa();
const request = require('request')
var port = process.env.PORT || '8100';
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
app.use(async function (ctx, next) {
    console.log(ctx.path);
    const root = path.resolve(__dirname, '../static')
    const fpath = path.join(root, ctx.path);
    console.log(fpath);

    switch (ctx.path) {
        case '/html/download.html':
            console.log('index');
            ctx.response.type = 'html';
            const r = path.resolve(__dirname, '../static')
            const p = path.join(r, '/html/download.html')
            ctx.response.body = await fs.readFile(p, 'utf8')
            break
        case '/download/fsExcel':
            console.log('fsExcel');
            const data = [
                [1, 2, 3],
                [true, false, null, 'sheetjs'],
                ['foo', 'bar', new Date('2014-02-19T14:30Z'), '0.3'],
                ['baz', null, 'qux'],
            ];
            const buffer = xlsx.build([{ name: 'mySheetName', data }]);
            // Write file to the response
            const tmpExcel = `filename.xlsx`;
            fs.writeFileSync(
                tmpExcel,
                buffer,
                {
                    encoding: 'utf8',
                },
                err => {
                    if (err) throw new Error(err);
                },
            );
            ctx.set('Content-disposition', `attachment; filename="${tmpExcel}"`);
            ctx.set('Content-Type', 'application/octet-stream');
            ctx.body = fs.createReadStream(tmpExcel)
            // delete file after sending to client
            fs.unlinkSync(tmpExcel);
            break
        default:
            const fstat = await stat(fpath)
            if (fstat.isFile()) {
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
            break
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
// app.use(async function (ctx) {
//     console.log(ctx);
// })

var server = http.createServer(app.callback());
server.listen(port);
console.log('download demo1 server start ......   ');