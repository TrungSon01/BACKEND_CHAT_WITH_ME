# Railway Deployment Guide

## Environment Variables

Set these environment variables in your Railway project:

### Database Configuration
```
DB_HOST=your_mysql_host
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=your_mysql_database
DB_PORT=3306
```

### Server Configuration
```
PORT=3000
NODE_ENV=production
```

### Railway will automatically set:
```
RAILWAY_ENVIRONMENT=production
```

## SSL/WSS Support

Railway automatically provides SSL termination, so:
- Your app runs on HTTP internally
- Railway handles HTTPS/WSS for external connections
- No need to manage SSL certificates manually

## Frontend Configuration

Update your frontend environment variables:

```env
VITE_API_BASE_URL=https://your-railway-app.up.railway.app
```

## WebSocket URLs

- **Development**: `ws://localhost:3000`
- **Production (Railway)**: `wss://your-railway-app.up.railway.app`

## Deployment Steps

1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy - Railway will automatically:
   - Install dependencies
   - Run `npm start`
   - Provide SSL certificates
   - Handle HTTPS/WSS termination

## Testing WSS

After deployment, your WebSocket connections will automatically use WSS in production. 