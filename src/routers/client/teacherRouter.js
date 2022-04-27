const express=require("express");

let router=express.Router();
//获取讲师列表
router.get("/list",(req,resp)=>{
    console.log(req.query);
    const {page_num=1,page_size=3,is_star="-1"}=req.query;
    resp.tool.execSQLAutoResponse(`
        select
            t_teacher.id,
            header,
            position,
            name,
            is_star,
            count(t_course.id) as course_count,
            t_teacher.intro
        from
            t_teacher
            left join t_course on t_teacher.id = t_course.teacher_id
        group by
            t_teacher.id
        having
            is_star in (${""+is_star === "-1"?"0,1":is_star})
            limit ${(page_num -1)*page_size},${page_size};
    `)
});
//讲师详情页
router.get("/detail/:id",(req,resp)=>{
    const {id}=req.params;
    if(!id){
        resp.send(resp.tool.ResponseTemp(-2,"必须填写参数id"));
        return;
    };
    Promise.all([resp.tool.execSQL(`
        SELECT id,
               NAME,
               header,
               position,
               intro,
               is_star
        FROM t_teacher
        WHERE id = ${id};
        `),resp.tool.execSQL(`
            SELECT
                t_course.id,
                teacher_id,
                title,
                fm_url,
                is_hot,
            count( t_comments.id ) AS comment_total_count,
            avg(
                ifnull( t_comments.score, 0 )) AS comment_avg_score 
            FROM
                t_course
            LEFT JOIN t_comments ON t_course.id = t_comments.course_id 
            GROUP BY
                t_course.id 
            HAVING
                teacher_id = ${id};
            `)]).then(([teacherResult,courseResult])=>{
        if(teacherResult.length >=1){
            let teacher=teacherResult[0];
            teacher.course=courseResult;
            resp.send(resp.tool.ResponseTemp(0,teacher));
        }else {
            resp.send(resp.tool.ResponseTemp(0,{}));
        }

    })
});




module.exports=router;