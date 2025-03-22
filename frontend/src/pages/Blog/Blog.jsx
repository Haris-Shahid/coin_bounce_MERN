import { useEffect, useState } from "react";
import { getAllBlogs } from "../../api/internal";
import Loader from "../../components/Loader/Loader";
import styles from './Blog.module.css';
import { useNavigate } from "react-router-dom";

function Blog (){
    const navigate = useNavigate();
    const [blogs, setBlogs] = useState([]);

    useEffect(() => {
(async function getAllBlogsApiCall(){
    const response = await getAllBlogs();
    if(response.status === 200){
        setBlogs(response.data.blogs)
    }
})()

return () => {
    setBlogs([]);
}
    }, [])

    if(blogs.length === 0){
        return <Loader text='...' />
    }
    
    return(
        <div className={styles.blogsWrapper} >
            {
                blogs.map((blog) => {
                    return(
                        <div onClick={() => navigate(`/blog/${blog._id}`)} key={blog._id} className={styles.blog} id={blog._id} >
                            <h1>{blog.title}</h1>
                            <img src={blog.photo} />
                            <p>{blog.content}</p>
                        </div>
                    )
                })
            }
        </div>
    )   
}

export default Blog;