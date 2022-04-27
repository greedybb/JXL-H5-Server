const express=require("express");
const {rizhiM,handlerErrorMF,notFoundMF,crossDomainM,toolM}=require("./middleware/ws_middleware");
const path = require("path");
//前台路由器
const homeRouter=require("./routers/client/homeRouter");
const teacherRouter=require("./routers/client/teacherRouter");
const courseRouter=require("./routers/client/courseRouter");
const articleRouter=require("./routers/client/articleRouter");
const searchRouter=require("./routers/client/searchRouter");
const userRouter=require("./routers/client/userRouter");
// 后台路由器
const mAdCourseRouter = require("./routers/manager/adCourseRouter");
const mAdminRouter = require("./routers/manager/adminRouter");
const mArticleRouter = require("./routers/manager/articleRouter");
const mCategoryRouter = require("./routers/manager/categoryRouter");
const mConfigRouter = require("./routers/manager/configRouter");
const mCourseRouter = require("./routers/manager/courseRouter");
const mOverViewRouter = require("./routers/manager/overViewRouter");
const mStatisticsRouter = require("./routers/manager/statisticsRouter");
const mTeacherRouter = require("./routers/manager/teacherRouter");

let app=express();

//跨域中间件
app.use(crossDomainM);
//挂载工具的中间件
app.use(toolM);
//处理post数据中间件
app.use(express.json(), express.urlencoded({extended: true}));
//日志中间件
app.use(rizhiM);
//静态资源中间件
app.use(express.static(path.resolve(__dirname,"public")));
//挂载路由中间件
    //前台路由
app.use("/api/client/home",homeRouter);
app.use("/api/client/teacher",teacherRouter);
app.use("/api/client/course",courseRouter);
app.use("/api/client/article",articleRouter);
app.use("/api/client/search",searchRouter);
app.use("/api/client/user",userRouter);
    //后台路由
app.use("/api/manager/ad_course", mAdCourseRouter);
app.use("/api/manager/admin", mAdminRouter);
app.use("/api/manager/article", mArticleRouter);
app.use("/api/manager/category", mCategoryRouter);
app.use("/api/manager/config", mConfigRouter);
app.use("/api/manager/course", mCourseRouter);
app.use("/api/manager/over_view", mOverViewRouter);
app.use("/api/manager/statistics", mStatisticsRouter);
app.use("/api/manager/teacher", mTeacherRouter);
//404中间件
app.use(notFoundMF(path.resolve(__dirname, "./defaultPages/404.html")));
//错误处理中间件
app.use(handlerErrorMF(path.resolve(__dirname, "./defaultPages/500.html")));

app.listen(5000,()=>{
    console.log("撩学堂-后端项目服务器启动成功：localhost:5000/")
});