const express=require("express");
const homeRouter=require("./routers/homeRouter");
const {rizhiM,handlerErrorMF,notFoundMF,crossDomainM}=require("./middleware/ws_middleware");
const path = require("path");

let app=express();

//跨域中间件
app.use(crossDomainM);
//处理post数据中间件
app.use(express.json(), express.urlencoded({extended: true}));
//日志中间件
app.use(rizhiM);
//静态资源中间件
app.use(express.static(path.resolve(__dirname,"public")));
//挂载路由中间件
app.use("/",homeRouter);
//404中间件
app.use(notFoundMF(path.resolve(__dirname, "./defaultPages/404.html")));
//错误处理中间件
app.use(handlerErrorMF(path.resolve(__dirname, "./defaultPages/500.html")));

app.listen(5000,()=>{
    console.log("撩学堂-后端项目服务器启动成功：localhost:5000/")
});