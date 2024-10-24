const Joi = require('joi');
const fs = require('fs');
const Blog = require('../models/blogs');
const { BACKEND_SERVER_PATH } = require('../config');
const BlogDTO = require('../dto/blog');
const BlogDetailsDTO = require('../dto/blog-details');
const Comment = require('../models/comment');

const mongodbIdPattern = /^[0-9a-fA-F]{24}$/;
const blogController = {
    async create(req, res, next){
        // validate req body
        // client side -> base64 encoded string ->decode -> store -> save photo's path in db
       const createBlogSchema = Joi.object({
        title: Joi.string().required(),
        author: Joi.string().regex(mongodbIdPattern).required(),
        content: Joi.string().required(),
        photo: Joi.string().required()
       })
       const {error} = createBlogSchema.validate(req.body);
       if(error){
        return next(error);
       }

       const { title, author, content, photo } = req.body;
        // handle photo storage , naming

        // read as buffer
        const buffer = Buffer.from(photo.replace(/^data:image\/(png|jpg|jpeg);base64,/,''), 'base64');
        
        // allot a random name
        const imagePath = `${Date.now()}-${author}.png`;

        // save locally
        try{
            fs.writeFileSync(`storage/${imagePath}`, buffer);
        }catch(error){
           return next(error);
        }

        // save blog in db
        let newBlog;
        try {
            newBlog = new Blog({
                title,
                author,
                content,
                photoPath: `${BACKEND_SERVER_PATH}/storage/${imagePath}`
            })
            await newBlog.save();
        } catch (error) {
            return next(error)
        }
        const blogDto = new BlogDTO(newBlog);
        // return response
        res.status(201).json({blog: blogDto});
    },
    async getAll(req, res, next){
        try {
            const blogs = await Blog.find({});
            const blogsDto = [];
            for(let i=0; i<blogs.length;i++){
                const dto = new BlogDTO(blogs[i]);
                blogsDto.push(dto)
            }
            return res.status(200).json({blogs: blogsDto});        
        } catch (error) {
            return next(error);
        }
    },
    async getById(req, res, next){
        // validate id
        const getByIdSchema = Joi.object({
            id: Joi.string().regex(mongodbIdPattern).required()
        })
        const {error} = getByIdSchema.validate(req.params);
        if(error){
            return next(error);
        }

        const {id} = req.params;

        let blog;
        try {
            blog = await Blog.findOne({_id: id}).populate('author')
        } catch (error) {
            return next(error);
        }

        const blogDto = new BlogDetailsDTO(blog);

        // response
        return res.status(200).json({blog:blogDto});
    },
    async update(req, res, next){

        const updateBlogSchema = Joi.object({
            title: Joi.string(),
            content: Joi.string(),
            photo: Joi.string(),
            author: Joi.string().regex(mongodbIdPattern).required(),
            blogId: Joi.string().regex(mongodbIdPattern).required(),
        })
        
        const {error} = updateBlogSchema.validate(req.body);

        if(error){
            return next(error);
        }

        const{ title, content, author, blogId, photo } = req.body;

        let blog;

        try{
            blog = await Blog.findOne({
               _id: blogId
           })
        }catch(error){
            return next(error);
        }

        if(photo){
           let previousPhoto = blog.photoPath;
           previousPhoto = previousPhoto.split('/').at(-1);

            //    delete photo
            fs.unlinkSync(`storage/${previousPhoto}`)

            // now saving new photo

            const buffer = Buffer.from(photo.replace(/^data:image\/(png|jpg|jpeg);base64,/,''), 'base64');
        
            // allot a random name
            const imagePath = `${Date.now()}-${author}.png`;
    
            // save locally
            try{
                fs.writeFileSync(`storage/${imagePath}`, buffer);
            }catch(error){
               return next(error);
            }

            await Blog.updateOne({_id: blogId},{title, content, photoPath: `${BACKEND_SERVER_PATH}/storage/${imagePath}`});
        }else{
            await Blog.updateOne({_id: blogId},{title, content})
        }

        return res.status(200).json({message: 'blog updated!'})

    },
    async delete(req, res, next){

        // validate id
        // delete blog
        // delete comments on this blog

        const deleteBlogSchema = Joi.object({
            id: Joi.string().regex(mongodbIdPattern).required()
        })

        const {error} = deleteBlogSchema.validate(req.params);

        if(error){
          return  next(error);
        }

        const {id} = req.params;

        try{
           await Blog.deleteOne({_id: id});

           await Comment.deleteMany({blog: id});

        }catch(error){
            return  next(error);
        }

        return res.status(200).json({message: 'blog deleted!'})


    },
}

module.exports = blogController;