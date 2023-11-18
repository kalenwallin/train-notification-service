import JWT from 'jsonwebtoken';
export const JsonWebTokenError = JWT.JsonWebTokenError;
// This is an async/await promise wrapper over the jsonwebtoken package which does callback style 
export default {
    verify(token, secretOrPublicKey, options) {
        return new Promise((resolve, reject) => {
            JWT.verify(token, secretOrPublicKey, { ...options, complete: true }, (err, data) => {
                if (err)
                    return reject(err);
                else
                    return resolve(data);
            });
        });
    },
    sign(payload, secretOrPrivateKey, options) {
        return new Promise((resolve, reject) => {
            JWT.sign(payload, secretOrPrivateKey, options, (err, data) => {
                if (err)
                    return reject(err);
                else
                    return resolve(data);
            });
        });
    }
};
