import Fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
// import FastifySession from '@fastify/session'
// import MySQLSession from 'express-mysql-session'
// import { Pool } from 'mysql2/promise';
import dotenv from 'dotenv'
import JWT from './util/jwt-promise.js'
dotenv.config()

const JWT_ENCRYPT_KEY = process.env.JWT_ENCRYPT_KEY
if(!JWT_ENCRYPT_KEY) throw new Error('Missing required env "JWT_ENCRYPT_KEY", exiting...')

import path from 'path'
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = Fastify({
    pluginTimeout: 20000,
    trustProxy: process.env.NODE_ENV === "production",
    logger: {
        transport: process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                    translateTime: 'HH:MM:ss Z',
                    ignore: 'pid,hostname',
                }
            } : undefined,
        level: process.env.FASTIFY_DEBUG_LEVEL || 
            (process.env.NODE_ENV !== "production" ? 'debug' : 'error')
      }
})

app.get('/api/gentoken/:id', async (req: FastifyRequest<{ Params: { id: string }}>, reply: FastifyReply) => {
    const jwt = await JWT.sign({
        sub: req.params.id,
        isa: Math.floor(Date.now() / 1000)
    }, JWT_ENCRYPT_KEY)
    reply.header("Content-Type", "text/plain");
    return reply.send(jwt)
})

app.post('/api/ingest', async (req, reply) => {

})


// Gets list of endpoints
app.get('/api/endpoints', async (req, reply) => {

})

app.get('/api/endpoints/:id', async (req, reply) => {

})

const WEB_PORT = Number(process.env.WEB_PORT) || 8080
app.listen({port: WEB_PORT}, () => console.info(`[Server] Listening on :${WEB_PORT}`))