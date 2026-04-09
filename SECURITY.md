# Security Policy

## Supported Versions

This project follows semantic versioning for security updates. Only the latest stable release and the previous minor release receive security patches.

| Version | Supported          |
| ------- | ------------------ |
| 14.x    | ✅ Fully supported |
| < 14.0  | ❌ Not supported   |

Older versions are not actively maintained with security updates. We recommend always using the latest stable release.

## Reporting a Vulnerability

We take security vulnerabilities seriously. Thank you for your responsible disclosure.

**DO NOT create public GitHub issues for security vulnerabilities.**

Instead, please report vulnerabilities via email to:

```
security@yourdomain.com
```

### Reporting Guidelines

- Provide a clear description of the vulnerability
- Include steps to reproduce the issue
- Indicate affected versions
- Do not disclose the vulnerability publicly until it has been resolved
- Allow reasonable time for us to investigate and release a fix

### Response Timeline

- Initial acknowledgment: Within 48 hours
- Status update: Every 7 days after acknowledgment
- Fix release: Typically within 30 days, depending on complexity

We will notify you when a fix is available and may publicly acknowledge your contribution if you wish.

## Security Best Practices

### Environment Variables

- Never commit `.env` files containing secrets to version control
- Use environment variable management provided by your deployment platform
- Rotate secrets periodically
- Do not log or expose environment variables in error messages or client-side code
- All secrets should be stored server-side only

### API Routes

- All API routes must implement appropriate authentication and authorization checks
- Use Next.js middleware for global authentication requirements
- Validate and sanitize all user input before processing
- Implement proper rate limiting for public endpoints
- Restrict HTTP methods to only those required

### Authentication

- Use secure, HTTP-only cookies for session management
- Implement proper password hashing with strong algorithms (bcrypt, Argon2)
- Enforce password complexity requirements
- Implement account locking after multiple failed attempts
- Use short-lived access tokens with refresh token rotation
- Validate all authentication tokens on every request

### Input Validation

- Validate all user input on the server side (client-side validation is not sufficient)
- Sanitize data before using it in database queries or rendering
- Use parameterized queries to prevent SQL injection
- Escape user input when rendering in templates
- Implement strict content type validation for uploads

### Dependencies

- Regularly run `npm audit` or equivalent to check for vulnerable dependencies
- Keep dependencies updated to their latest secure versions
- Remove unused dependencies
- Use lock files (`package-lock.json`) to ensure consistent installations
- Avoid dependencies with known vulnerabilities or unmaintained status

### Transport Security

- Always use HTTPS in production environments
- Enforce HTTPS with HSTS headers
- Disable insecure protocols and cipher suites
- Secure cookies with `Secure` and `SameSite` attributes
- Implement proper CORS configuration

## Deployment Security

### General Deployment

- Run the application with the least necessary privileges
- Disable debug mode and development features in production
- Configure proper security headers (CSP, X-Frame-Options, X-XSS-Protection)
- Implement Content Security Policy (CSP) to prevent XSS attacks
- Disable directory listing and unnecessary server features

### Server-Side Protection

- Never expose server-side code or secrets to the client
- Use server components for sensitive logic where possible
- Do not include sensitive information in server action responses
- Validate that all authorization checks run on the server
- Avoid leaking implementation details in error messages

### Platform Specific

When deploying to Vercel or similar platforms:

- Use encrypted environment variables
- Do not store secrets in build-time variables
- Enable preview deployment protection
- Configure appropriate firewall rules
- Monitor access logs for unusual activity

## Responsible Disclosure

We encourage ethical security research. Researchers who:

- Make a good faith effort to avoid privacy violations, data destruction, and service disruption
- Only access data necessary to demonstrate the vulnerability
- Do not modify or exfiltrate user data
- Follow the reporting process outlined above

will not be subject to legal action for vulnerabilities discovered and reported in good faith.

We are committed to working with the security community to protect users and maintain a secure application.
