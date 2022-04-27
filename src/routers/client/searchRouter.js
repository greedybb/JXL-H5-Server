const express=require("express");

let router=express.Router();
//课程搜索
router.get("/course",(req,resp)=>{
	const {key=""}=req.query;
	resp.tool.execSQLAutoResponse(`
		SELECT
			t_course.id,
			category_id,
			title,
			fm_url,
			is_hot,
			intro,
			teacher_id,
		count( t_comments.id ) AS comment_total_count,
		avg( ifnull( t_comments.score, 0 )) AS comment_avg_score 
		FROM
			t_course
		LEFT JOIN t_comments ON t_course.id = t_comments.course_id 
		GROUP BY
			t_course.id
		HAVING title like "%${key}%";
	`,"课程的搜索结果！");
});
//讲师搜索
router.get("/teacher",(req,resp)=>{
	const {key=""}=req.query;
	resp.tool.execSQLAutoResponse(`
		SELECT
			t_teacher.id,
			header,
			position,
			name,
			is_star,
			count( t_course.id ) AS course_count,
			t_teacher.intro 
		FROM
			t_teacher
		LEFT JOIN t_course ON t_teacher.id = t_course.teacher_id 
		GROUP BY
			t_teacher.id 
		HAVING
		NAME LIKE "%${key}%";
	`,"课程的搜索结果！")
});
//文章搜索
router.get("/article",(req,resp)=>{
	const {key=""}=req.query;
	resp.tool.execSQLAutoResponse(`
        SELECT id,title,intro,create_time
        FROM t_news
		WHERE title like "%${key}%"
        order by create_time;
	`,"课程的搜索结果！")
});
//全部结果
router.get("/all",(req,resp)=>{
	const {key=""}=req.query;
	Promise.all([resp.tool.execSQL(`
		SELECT
			t_course.id,
			category_id,
			title,
			fm_url,
			is_hot,
			intro,
			teacher_id,
		count( t_comments.id ) AS comment_total_count,
		avg( ifnull( t_comments.score, 0 )) AS comment_avg_score 
		FROM
			t_course
		LEFT JOIN t_comments ON t_course.id = t_comments.course_id 
		GROUP BY
			t_course.id
		HAVING title like "%${key}%";
	`),resp.tool.execSQL(`
		SELECT
			t_teacher.id,
			header,
			position,
			name,
			is_star,
			count( t_course.id ) AS course_count,
			t_teacher.intro 
		FROM
			t_teacher
		LEFT JOIN t_course ON t_teacher.id = t_course.teacher_id 
		GROUP BY
			t_teacher.id 
		HAVING
		NAME LIKE "%${key}%";
	`),resp.tool.execSQL(`
        SELECT id,title,intro,create_time
        FROM t_news
		WHERE title like "%${key}%"
        order by create_time;
	`)]).then(([courseResult,teacherResult,articleResult])=>{
		resp.send(resp.tool.ResponseTemp(0,"查找成功",{
			courseResult,
			teacherResult,
			articleResult
		}))
	})
});

module.exports=router;