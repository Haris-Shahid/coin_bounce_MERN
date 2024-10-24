const jwt = require('jsonwebtoken');
const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = require('../config');
const RefreshToken = require('../models/token');
// type node in terminal to make a secret token
// const crypto = require('crypto')
// undefined
// > crypto.randomBytes(64).toString('hex')

class JWTService{
    // sign access token
    static signAccessToken(payload, expiryTime){
        return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: expiryTime });
    }
    // sign refresh token
    static signRefreshToken(payload, expiryTime){
        return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: expiryTime });
    }
    // Verify access token
    static verifyAccessToken(token){
        return jwt.verify(token, ACCESS_TOKEN_SECRET);
    }
    // Verify refresh token
    static verifyRefreshToken(token){
        return jwt.verify(token, REFRESH_TOKEN_SECRET);
    }
    // store refresh token
    static async storeRefreshToken(token, userId){
        try{
           const newToken = new RefreshToken({
                token,
                userId
            });

            // store in db
            await newToken.save();
            
        }catch(error){
            console.log(error, "Error in refresh token save")

        }
    }
}

module.exports = JWTService;