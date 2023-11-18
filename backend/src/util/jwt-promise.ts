import JWT from 'jsonwebtoken'

export interface Jwt<T> extends JWT.Jwt {
    payload: T
}

export const JsonWebTokenError = JWT.JsonWebTokenError

// This is an async/await promise wrapper over the jsonwebtoken package which does callback style 
export default {
    verify<T>(token: string, secretOrPublicKey: JWT.Secret, options?: JWT.VerifyOptions): Promise<Jwt<T>> {
        return new Promise((resolve, reject) => {
            JWT.verify(token, secretOrPublicKey, {...options, complete: true }, (err: Error, data: JWT.Jwt) => {
                if(err) return reject(err)
                else return resolve(data as Jwt<T>)
            })
        })
    },
    sign<T extends object>(payload: T, secretOrPrivateKey: JWT.Secret, options?: JWT.SignOptions): Promise<string> {
        return new Promise((resolve, reject) => {
            JWT.sign(payload, secretOrPrivateKey, options, (err: Error, data: string) => {
                if(err) return reject(err)
                else return resolve(data)
            })
        })
    }
}