# Security Policy

## Supported Versions

We actively maintain and provide security updates for the following versions of **GithubSpy**:

| Version | Supported          | Security Maintenance |
| ------- | ------------------ | -------------------- |
| 1.x.x   | :white_check_mark: | Active Support       |
| < 1.0.0 | :x:                | Deprecated           |

---

## Client-Side Security Architecture

**GithubSpy** is engineered with a strict **Zero-Knowledge, Client-Side Only** architecture:

1. **Direct API Dispatch**: All API calls originate directly from your web browser to GitHub's official REST API endpoint (`https://api.github.com`). There is no intermediate proxy or third-party tracking server.
2. **Local Token Isolation**: GitHub Personal Access Tokens (PATs) entered by users are stored exclusively in the browser's local sandbox (`window.localStorage.getItem('githubspy_pat')`). Tokens are never logged, forwarded, or transmitted to any external system.
3. **Strict Content Security**: The deployment enforces strict security headers including `nosniff`, `DENY` framing to prevent clickjacking, cross-origin referrers, and restrictive permission policies.

---

## Reporting a Vulnerability

The maintainer takes the security of GithubSpy and its users very seriously. If you discover an issue or potential vulnerability, please follow responsible disclosure protocols:

1. **Do NOT file a public issue** on GitHub for sensitive security bugs.
2. **Submit via GitHub Private Vulnerability Reporting**:
   - Navigate to the repository's **Security** tab at [https://github.com/TarunyaProgrammer/GithubSpy/security](https://github.com/TarunyaProgrammer/GithubSpy/security).
   - Click **"Report a vulnerability"** to open a private advisory draft.
3. **Direct Contact**:
   - Alternatively, contact the lead maintainer directly via GitHub at [@TarunyaProgrammer](https://github.com/TarunyaProgrammer).

### What to Include in Your Report

Please provide as much relevant information as possible to help us triage and resolve the issue quickly:
- Detailed steps to reproduce the vulnerability.
- Proof of Concept (PoC) scripts or request payloads, if applicable.
- Assessment of potential impact (e.g., Cross-Site Scripting, prototype pollution, token exfiltration risk).
- Your proposed remediation or patch, if available.

---

## Response Timeline & Commitment

- **Initial Response**: We will acknowledge receipt of your vulnerability report within **48 hours**.
- **Assessment & Triage**: We will confirm the validity of the issue within **5 business days**.
- **Fix & Disclosure**: We aim to release a patch and publish a security advisory within **14 days** of triage confirmation.
- **Attribution**: Responsible security researchers will be publicly credited in the release changelog and security advisory (unless anonymity is requested).

---

## Security Best Practices for Users

- **Least Privilege Tokens**: When generating a GitHub Personal Access Token (classic or fine-grained) for GithubSpy, grant only `public_repo` (read-only) permissions. Never grant administrative, secret-writing, or account-level scopes.
- **Shared / Public Devices**: Always click **"Remove Token"** in the API Token modal or clear site storage when using GithubSpy on shared or untrusted workstations.

---

*Authored and enforced by [@TarunyaProgrammer](https://github.com/TarunyaProgrammer).*
