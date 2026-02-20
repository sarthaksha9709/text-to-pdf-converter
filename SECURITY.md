# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 0.1.x   | ✅ Yes    |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

If you discover a security vulnerability, please report it responsibly:

1. **Email**: Open a [private security advisory](https://github.com/sarthaksha9709/text-to-pdf-converter/security/advisories/new) on GitHub.
2. **Include** as much detail as possible: description, steps to reproduce, potential impact, and any suggested fixes.
3. **Response time**: We aim to acknowledge reports within 48 hours and provide a fix or mitigation within 7 days for critical issues.

You will receive credit in the release notes when the fix is published, unless you prefer to remain anonymous.

## Security Best Practices for Users

### API Usage

- **Rate limiting**: The API enforces rate limits (100 requests per 15 minutes per IP). Do not attempt to bypass these limits.
- **File uploads**: Only `.txt` and `.md` files up to 5 MB are accepted. Never upload files containing sensitive data to a shared instance.
- **Text limits**: The API enforces a 50,000 character limit per request.

### Self-Hosting

If you are running this application yourself:

- Set `NODE_ENV=production` in your environment.
- Configure `CORS_ORIGIN` to your exact frontend domain — do **not** use `*` in production.
- Use a reverse proxy (nginx, Caddy) in front of the API to handle TLS termination.
- Store environment variables in your platform's secrets manager, not in `.env` files committed to source control.
- Keep dependencies up to date — run `pnpm audit` regularly.
- Enable HTTPS and redirect all HTTP traffic to HTTPS.

### Data Privacy

This application is **privacy-first**: no uploaded text or generated PDFs are stored on the server. All data is processed in memory and discarded immediately after each request.

## Known Security Considerations

- PDF generation happens server-side using `pdf-lib`, which does not parse external resources.
- File uploads are stored only in memory (not on disk) and are processed synchronously.
- All user input is validated and sanitized before processing.
