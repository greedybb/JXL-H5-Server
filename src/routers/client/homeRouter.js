const express=require("express");
const {response} = require("express");


let router = express.Router();

//网站联系方式等信息
router.get("/web_config",(req,resp)=>{
    resp.tool.execSQLAutoResponse(`
        select
            wechat_qrcode,
            mini_program,
            wb_qrcode,
            tel,
            app
        from
            t_config
        limit 1;
    `,"查询成功",result=>{
        if(result.length>0){
            return result[0];
        }else {
            return {};
        }
    })
});
//首页导航栏信息
router.get("/nav",(req,resp)=>{
    resp.tool.execSQLAutoResponse(`
        select
                id,
                title,
                route
            from
                t_nav;
    `,"导航菜单数据获取成功！"
    )
});
//获取焦点图课程信息
router.get("/focus_img",(req,resp)=>{
    resp.tool.execSQLAutoResponse(`
        select
            id,
            title,
            ad_url,
            course_id
        FROM
            t_ad
        WHERE
            is_show=1;`,"获取焦点图课程信息成功！")
});
//获取热门好课
router.get("/hot_course",(req,resp)=>{
    resp.tool.execSQLAutoResponse(`
        SELECT t_course.id,
           title,
           fm_url,
           is_hot,
           count(t_comments.course_id)      AS comment_total_count,
           avg(ifnull(t_comments.score, 0)) AS comment_avg_score
        FROM t_course
           LEFT JOIN t_comments ON t_course.id = t_comments.course_id
        GROUP BY t_course.id
        HAVING is_hot = 1 LIMIT 10`,"查询热门课程成功！")
});
//获取明星讲师
router.get("/star_teacher",(req,resp)=>{
    resp.tool.execSQLAutoResponse(`
        select
            id,
            name,
            header,
            position,
            intro
        FROM
            t_teacher
        WHERE
            is_star=1
            limit 6;`,"获取明星讲师成功！")
});
//获取最新文章
router.get("/last_news",(req,resp)=>{
    resp.tool.execSQLAutoResponse(`
        select
            id,
            title,
            create_time
        FROM
            t_news
        order by create_time desc
            limit 10;`,"获取最新新闻成功！")
});


module.exports=router;