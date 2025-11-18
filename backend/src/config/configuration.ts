export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  database: {
    url: process.env.DATABASE_URL,
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  },

  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3001', 'http://localhost:3002'],
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },

  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    s3Bucket: process.env.AWS_S3_BUCKET,
    region: process.env.AWS_REGION || 'us-east-1',
  },

  email: {
    provider: process.env.EMAIL_PROVIDER || 'sendgrid',
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY,
    },
    resend: {
      apiKey: process.env.RESEND_API_KEY,
    },
  },

  sms: {
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      phoneNumber: process.env.TWILIO_PHONE_NUMBER,
    },
  },

  rateLimit: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL, 10) || 60,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  },

  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10485760, // 10MB
    dest: process.env.UPLOAD_DEST || './uploads',
  },
});
