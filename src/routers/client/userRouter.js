const express=require("express");
const multer=require("multer");
const path=require("path");
const fs=require("fs");
const {response} = require("express");

let router=express.Router();

//注册账户
router.post("/register",(req,resp)=>{
	const {account,password}=req.body;
	resp.tool.execSQL(`
        SELECT id
        FROM t_user
        where account=?;
	`,[account]).then(result=>{
		if(result.length>0){
			resp.send(resp.tool.ResponseTemp(-2,"用户名已存在,请修改！",{}));
		}else {
			let nick_name="匿名";
			let header="/images/user/xl.jpg";
			let intro="喜欢IT，就来撩课！";
			console.log(account,password);
			resp.tool.execSQLTEMPAutoResponse(`
				insert into t_user (account,password,nick_name,header,intro) values (?,?,?,?,?);
			`,[account,password,nick_name,header,intro],"注册成功！",result=>{
				if(result.affectedRows>0){
					return {
						id:result.insertId,
						account,
						nick_name,
						header,
						intro
					}
				}
			})
		}
	})
});
//登录界面
router.post("/login",(req,resp)=>{
	const {account,password}=req.body;
	resp.tool.execSQLTEMPAutoResponse(`
		select id,account,nick_name,header,intro from t_user where account=? and password=?;
	`,[account,password],"验证成功！",result=>{
		if(result.length>0){
			return result[0];
		}else {
			return {
				id:-1,
				message:"用户名或密码错误"
			};
		}
	})

});
//学习历史记录
router.get("/study_history",(req,resp)=>{
	let {user_id}=req.query;
	if(!user_id){
		resp.send(resp.tool.ResponseTemp(-2,"请传入用户ID"));
		return
	};
	resp.tool.execSQLTEMPAutoResponse(`
	SELECT
		t_study_course.*,
		count( t_course_outline.id ) AS course_outline_count 
	FROM
	(
	SELECT
		t_study_history.id,
		t_study_history.user_id,
		t_study_history.course_id,
		t_course.title AS course_title,
		t_course.fm_url AS course_fm_url,
		t_course.is_hot AS course_is_hot,
		count( t_study_history.outline_id ) AS learned_count 
	FROM
		t_study_history
	LEFT JOIN t_course ON t_study_history.course_id = t_course.id 
	WHERE
		user_id = ${user_id} 
	GROUP BY
		t_study_history.course_id 
	) AS t_study_course
	LEFT JOIN t_course_outline ON t_course_outline.course_id = t_study_course.course_id 
	GROUP BY
		t_study_course.course_id;
	`,"获取学习记录成功")
});
//学习历史记录更新
router.post("/update_study_history",(req,resp)=>{
	//isfinish为1表示学完了，否则表示正在学习
	const {user_id,course_id,outline_id,isfinish="0"}=req.body;
	resp.tool.execSQL(`
		SELECT
			count(*) as is_learned 
		FROM
			t_study_history 
		WHERE
			user_id = ? 
		AND outline_id = ?;
	`,[user_id,outline_id]).then(result=>{
		let is_learned = result[0].is_learned;
		if(is_learned){
			resp.tool.execSQLTEMPAutoResponse(`
				UPDATE t_study_history 
				SET state = ? 
				WHERE
				user_id = ? 
				AND outline_id = ?;
			`,[""+isfinish ==="0"?1:2,user_id,outline_id],"更新成功!",result=>({}))
		}else{
			//新增
			resp.tool.execSQLTEMPAutoResponse(`
				INSERT INTO t_study_history ( user_id, course_id, outline_id, state ) VALUES (?,?,?,?);
			`,[user_id,course_id,outline_id,""+isfinish ==="0"?1:2],"插入成功",result=>({}))
		}
	})
})
//头像更新
let uploader = multer({dest: path.resolve(__dirname, "../../public/images/user")});
router.post("/update_header",uploader.single("header"), (req, resp) => {
    let file = req.file;
    let {user_id} = req.body;
    let extName = path.extname(file.originalname);
    fs.renameSync(file.path, path.resolve(__dirname, "../../public/images/user/", file.filename + extName));
    // 0. 把用户对应的老头像, 删除
    resp.tool.execSQL(`
        select header from t_user where id=?;
    `, [user_id]).then(result=>{
        if (result.length > 0) {
            let userObj = result[0];
            // /images/user/zsf.jpg
            let userHeaderPath = userObj.header;
            // 不是默认头像
            if (userHeaderPath.toLowerCase() !== "/images/user/xl.jpg") {
                // 删除对应的图片资源
                fs.unlinkSync(path.resolve(__dirname, "../../public", "." + userHeaderPath))
            }
            // 1. 把新图片路径, 存储到数据库表当中(更新)
            let newPath = `/images/user/${file.filename + extName}`;
            resp.tool.execSQL(`
                update t_user set header = ? where id=?;
            `, [newPath, user_id]).then(result=>{
                if (result.affectedRows > 0) {
                    resp.tool.execSQL("select id, account, nick_name, header, intro from t_user where id=?;", [user_id]).then(userResult=>{
                        resp.send(resp.tool.ResponseTemp(0, "更新头像成功", userResult[0]))
                    })
                } else {
                    resp.send(resp.tool.ResponseTemp(0, "更新头像失败", {}))
                }
            })
        }
    })
});
//用户基本信息修改
router.post("/update_info",(req,resp)=>{
	const {user_id,nick_name,intro}=req.body;
	resp.tool.execSQL(`
		update t_user set nick_name=?,intro=? where id=?;
	`,[nick_name,intro,user_id]).then(result=>{
		if(result.affectedRows>0){
			resp.tool.execSQL(`select id,account,nick_name,header,intro from t_user where id=?;`,[user_id]).then(userResult=>{
				resp.send(resp.tool.ResponseTemp(0,"更新成功！",userResult[0]))
			});
		}else {
			resp.send(resp.tool.ResponseTemp(0,"更新失败！", {}));
		}
	})
});
//密码的修改
router.post("/update_password",(req,resp)=>{
	const {account,password,new_password}=req.body;
	resp.tool.execSQLTEMPAutoResponse(`
		update t_user set password=? where account=? and password=?;
	`,[new_password,account,password],"更新密码完成！",result=>{
		if(result.affectedRows>0){
			return {
				message:"用户信息更新成功"
			}
		}else{
			return {
				message: "账户或密码错误，更新失败"
			}
		}
	})
});

module.exports=router;