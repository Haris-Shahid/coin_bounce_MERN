const Joi = require('joi');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const UserDTO = require('../dto/user');
const JWTService = require('../services/JWTService');
const RefreshToken = require('../models/token');

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,25}$/;

const authController = {
    async register(req, res, next){
        // 1. validate user input
        const userRegisterSchema = Joi.object({
            username: Joi.string().min(5).max(30).required(),
            name: Joi.string().max(30).required(),
            email: Joi.string().email().required(),
            password: Joi.string().pattern(passwordPattern).required(),
            confirmPassword: Joi.ref('password')
        });
        const {error} = userRegisterSchema.validate(req.body);

        if (error){
            return next(error);
        }

        const { username, name, email, password } = req.body;
        
        try{

            const emailInUse = await User.exists({email});
            const usernameInUse = await User.exists({username});

            if(emailInUse){
                const error = {
                    status: 409,
                    message: 'Email already registered, use another email!'
                };
                return next(error);
            }

            if(usernameInUse){
                const error = {
                    status: 409,
                    message: 'Username not available, choose another username!'
                };
                return next(error);
            }
        }catch(error){
            return next(error);
        }

        const hashPassword = await bcrypt.hash(password, 10);

        let accessToken;
        let refreshToken;
        let user;

        try{

            const useToRegister = new User({
                username,
                email,
                name,
                password: hashPassword
            })
    
            user = await useToRegister.save();
            
            // token generation

            accessToken = JWTService.signAccessToken({_id: user._id}, '5s');
            refreshToken = JWTService.signRefreshToken({_id: user._id}, '60m');

        }catch(error){
            return next(error);
        }

        // store refreshtoken in db

        await JWTService.storeRefreshToken(refreshToken, user._id)

        // send tokens in cookies
        res.cookie('accessToken', accessToken, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true
        });
        res.cookie('refreshToken', refreshToken, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true
        });
        
        const userDTO = new UserDTO(user);
        return res.status(200).json({user: userDTO, auth: true})

    },

    async login(req, res, next){

        const userLoginSchema = Joi.object({
            username: Joi.string().min(5).max(30).required(),
            password: Joi.string().pattern(passwordPattern).required().messages({
                'string.pattern.base': '"Password" must contain at least one lowercase letter, one uppercase letter, one digit, and be between 8 and 25 characters long.'
            }),
        });

        const {error} = userLoginSchema.validate(req.body);

        if(error){
            return next(new Error(error.details[0].message)); 
        }
        
        const { username, password } = req.body;
        let user;
        try{

           user = await User.findOne({username: username})
           if(!user){
            const error = {
                status: 401,
                message: 'Invalid username'
            }
            return next(error);
           }

            const match = await bcrypt.compare(password, user.password);

            if(!match){
                const error = {
                    status: 401,
                    message: 'Invalid password'
                }
                return next(error);
            }

        }catch(error){
            return next(error);
        }

        const accessToken = JWTService.signAccessToken({_id: user._id}, '5s');
        const refreshToken = JWTService.signRefreshToken({_id: user._id}, '60m');

       try{
            // update refresh token in database
           await RefreshToken.updateOne({
                _id: user._id
            }, {
                token: refreshToken
            },{
                upsert: true //to check matching record if exit update that one otherwise add one
            })

       }catch(error){
        return next(error);
       }

        // store refreshtoken in db

        await JWTService.storeRefreshToken(refreshToken, user._id)

        // send tokens in cookies
        res.cookie('accessToken', accessToken, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true
        });
        res.cookie('refreshToken', refreshToken, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true
        });

        const userDTO = new UserDTO(user);
        return res.status(200).json({user: userDTO, auth: true});

    },
    
    async logout(req,res, next){
    // delete refresh token from db
    const { refreshToken } = req.cookies;

    try {
      await RefreshToken.deleteOne({token: refreshToken});
    } catch (error) {
        return next(error);
    }

    // delete cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.status(200).json({user: null, auth: false});

   },
   
   async refresh(req, res, next) {
    // 1. get refreshToken from cookies
    // 2. verify refreshToken
    // 3. generate new tokens
    // 4. update db, return response

    const originalRefreshToken = req.cookies.refreshToken;

    let id;

    try {
      id = JWTService.verifyRefreshToken(originalRefreshToken)._id;
    } catch (e) {
      const error = {
        status: 401,
        message: "Unauthorized",
      };

      return next(error);
    }

    try {
      const match = RefreshToken.findOne({
        _id: id,
        token: originalRefreshToken,
      });

      if (!match) {
        const error = {
          status: 401,
          message: "Unauthorized",
        };

        return next(error);
      }
    } catch (e) {
      return next(e);
    }

    try {
      const accessToken = JWTService.signAccessToken({ _id: id }, "5s");

      const refreshToken = JWTService.signRefreshToken({ _id: id }, "60m");

      await RefreshToken.updateOne({ _id: id }, { token: refreshToken });

      res.cookie("accessToken", accessToken, {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
      });

      res.cookie("refreshToken", refreshToken, {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
      });
    } catch (e) {
      return next(e);
    }

    const user = await User.findOne({ _id: id });

    const userDto = new UserDTO(user);

    return res.status(200).json({ user: userDto, auth: true });
  },
}

module.exports = authController;