# Threat Model for Secure Notes

## 1. assets
- User accounts
- User notes (private content)
- Supabase database
- Authentication tokens

## 2. actors
- Legitimate users
- Malicious attacker (external)
- Malicious user (registered attacker)
- Network attacker (MITM)
- Developer/operator with access

## 3. entry points
- Login form
- Signup form
- Notes form (adding notes)
- API calls to Supabase
- Database

## 4. potential threats
### Physical Layer
- Stolen laptop → mitigated by local OS password & disk encryption

### network layer
- MITM attack → mitigated by HTTPS/TLS

### transport layer
- Token theft → mitigated by HttpOnly cookies

### application layer
- SQL Injection → mitigated by Supabase RLS policies
- CSRF → mitigated by same-site cookies
- XSS → mitigated by React auto-escaping
- Broken auth → mitigated by Supabase Auth
- Broken access control → mitigated by RLS

## 5. summary of security posture
The application is protected through modern best practices including RLS, TLS, hashed passwords, and input validation. Remaining risks include social engineering and user-side compromises.