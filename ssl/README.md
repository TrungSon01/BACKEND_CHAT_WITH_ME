# SSL Certificate Setup for WSS

To enable secure WebSocket connections (WSS), you need to place your SSL certificates in this directory:

## Required Files:
- `private.key` - Your private key file
- `certificate.crt` - Your SSL certificate file

## For Development:
You can generate self-signed certificates for development:

```bash
# Generate private key
openssl genrsa -out private.key 2048

# Generate self-signed certificate
openssl req -new -x509 -key private.key -out certificate.crt -days 365
```

## For Production:
Use certificates from your SSL provider (Let's Encrypt, etc.)

## Notes:
- The server will automatically fall back to HTTP/WS if SSL certificates are not found
- Make sure to add these files to your .gitignore to keep them secure
- For Railway deployment, you may need to configure SSL through their platform 