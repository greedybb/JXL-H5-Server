const express=require("express");

let router=express.Router();

//获取课程列表（根据分类ID进行获取）
router.get("/list",(req,resp)=>{
	const {page_num=1,page_size=6,category_id=-1}=req.query;
	resp.tool.execSQLAutoResponse(`
        SELECT id,title,intro,create_time
        FROM t_news
        order by create_time
		limit ${(page_num-1)*page_size},${page_size};
	`,"获取文章列表成功！")
});
//文章详情
router.get("/detail/:id",(req,resp)=>{
	const {id}=req.params;
	resp.tool.execSQLAutoResponse(`
		SELECT
			id,
			title,
			create_time,
			content 
		FROM
			t_news 
		WHERE
			id =${id};
	`,"文章详情获取成功！",result=>{
		if(result.length>=1){
			return result[0];
		}else {
			return {};
		}
	});
});


module.exports=router;