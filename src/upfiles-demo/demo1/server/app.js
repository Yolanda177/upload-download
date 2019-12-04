/**
 * 服务入口
 */
var http = require('http');
var koaStatic = require('koa-static');
var path = require('path');
var koaBody = require('koa-body');
var fs = require('fs');
var Koa = require('koa2');

var app = new Koa();
var port = process.env.PORT || '8100';

var uploadHost = `http://localhost:${port}/uploads/`;

app.use(koaBody({
    formidable: {
        //设置文件的默认保存目录，不设置则保存在系统临时目录下  os
        uploadDir: path.resolve(__dirname, '../static/uploads')
    },
    multipart: true // 支持文件上传
}));

//开启静态文件访问
app.use(koaStatic(
    path.resolve(__dirname, '../static')
));

//二次处理文件，修改名称
app.use((ctx) => {
    if (ctx.path === '/upload-form') {
        var files = ctx.request.files.f1;//得到上传文件的数组
        var result = [];
        if (!Array.isArray(files)) {
            files = [files];
        }
        files && files.forEach(item => {
            console.log(item)
            var path = item.path.replace(/\\/g, '/');
            var fname = item.name;//原文件名称
            var nextPath = path + fname;
            if (item.size > 0 && path) {
                //得到扩展名
                var extArr = fname.split('.');
                var ext = extArr[extArr.length - 1];
                var nextPath = path + '.' + ext;
                //重命名文件
                fs.renameSync(path, nextPath);

                result.push(uploadHost + nextPath.slice(nextPath.lastIndexOf('/') + 1));
            }
        });
        ctx.body = `{
            "fileUrl":${JSON.stringify(result)}
        }`;
    }
    // 检测接口地址为 /upfile
    if (ctx.path === '/upfile-jq') {
        console.log(ctx.request.files);
        var file = ctx.request.files ? ctx.request.files.f1 : null; //得到文件对象
        if (file) {

            var path = file.path.replace(/\\/g, '/');
            var fname = file.name; //原文件名称
            var nextPath = '';
            if (file.size > 0 && path) {
                //得到扩展名
                var extArr = fname.split('.');
                var ext = extArr[extArr.length - 1];
                nextPath = path + '.' + ext;
                //重命名文件
                fs.renameSync(path, nextPath);
            }
            //以 json 形式输出上传文件的存储地址
            ctx.body = getRenderData({
                data: `${uploadHost}${nextPath.slice(nextPath.lastIndexOf('/') + 1)}`
            });
        } else {
            ctx.body = getRenderData({
                code: 1,
                msg: 'file is null'
            });
        }

    }
});

/**
 * 
 * @param {设置返回结果} opt 
 */
function getRenderData(opt) {
    return Object.assign({
        code: 0,
        msg: '',
        data: null
    }, opt);
}
/**
 * http server
 */
var server = http.createServer(app.callback());
server.listen(port);
console.log('demo1 server start ......   ');