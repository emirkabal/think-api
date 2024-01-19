import Redis from "ioredis"

const redis = new Redis(process.env.REDIS_URL, {
  reconnectOnError: () => true
})

export default redis
