import Fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
// import FastifySession from '@fastify/session'
// import MySQLSession from 'express-mysql-session'
// import { Pool } from 'mysql2/promise';
import dotenv from 'dotenv'
import JWT from './util/jwt-promise.js'
import FastifyCors from '@fastify/cors'
dotenv.config()

const JWT_ENCRYPT_KEY = process.env.JWT_ENCRYPT_KEY
if(!JWT_ENCRYPT_KEY) throw new Error('Missing required env "JWT_ENCRYPT_KEY", exiting...')
if(!process.env.GOOGLE_VISION_APIKEY) {
    throw new Error("Missing required env \"JWT_ENCRYPT_KEY\", exiting")
}

export interface AuthPayload {
    sub: number,
    iat: number,
    title: string,
    lat: number,
    lng: number
}

import path from 'path'
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import EndpointManager, { NodeState } from './NodeManager.js'

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
app.register(FastifyCors, {
    origin: '*'
})

declare module 'fastify' {
    export interface FastifyInstance {
      em: EndpointManager
    }
  }
  

app.decorate("em", new EndpointManager())

app.get('/api/gentoken/:id/:lat/:lng', async (req: FastifyRequest<{ Params: { id: string, lat: number, lng: number }, Querystring: { title: string }}>, reply: FastifyReply): Promise<AuthPayload> => {
    const jwt = await JWT.sign<AuthPayload>({
        sub: Number(req.params.id),
        iat: Math.floor(Date.now() / 1000),
        title: req.query.title || `Node #${req.params.id}`,
        lng: req.params.lng,
        lat: req.params.lat
    }, JWT_ENCRYPT_KEY)
    reply.header("Content-Type", "text/plain");
    return reply.send(jwt)
})

// image send
import fs from 'fs'
app.post('/api/ingest/:state', async (req: FastifyRequest<{Params: {state: number}}>, reply) => {
    try {
        const endpoint = await validateEndpoint(req.headers['authorization'])
        if(!endpoint) {
            return reply.code(401).send({ error: "UNAUTHORIZED", message: "No valid token" })
        }
        let state = NodeState.Unknown
        if(req.params.state == 1)
            state = NodeState.Detection
        else if(req.params.state == 0)
            state = NodeState.Clear
        
        app.em.setState(endpoint.sub, state)
    } catch(err) {
        console.error(err.code, err.stack)
        return reply.code(401).send({ error: "UNAUTHORIZED", message: "JWT token is invalid" })
    }
})

async function validateEndpoint(jwtToken: string) {
    if(!jwtToken) return
    const jwt = await JWT.verify<AuthPayload>(jwtToken, JWT_ENCRYPT_KEY)
    return jwt.payload
}

// Gets list of endpoints
app.get('/api/nodes', async (req, reply) => {
    return reply.send({
        nodes: app.em.getNodesAll()
    })
})

app.get('/api/nodes/:id', async (req: FastifyRequest<{Params: { id: number }}>, reply) => {
    const node = app.em.getNode(req.params.id)
    if(!node) return reply.code(404).send({error: "UNKNOWN_NODE" })
    return reply.send({ node })
})

app.get('/api/nodes/bulk/:nodeids/', async (req: FastifyRequest<{Params: { nodeids: string }}>, reply) => {
    if(!req.params.nodeids) {
        return reply.code(400).send({ error: "NO_NODE_IDS", message: ":nodeids is empty"})
    }
    const nodeIds = req.params.nodeids.split(",")
    return reply.send({
        nodes: app.em.getNodes(nodeIds)
    })
})

const WEB_PORT = Number(process.env.WEB_PORT) || 8081
app.listen({port: WEB_PORT}, () => console.info(`[Server] Listening on :${WEB_PORT}`))