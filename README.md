# Secure Notes App

This is a simple Next.js + Supabase application that allows users to sign up, log in, and create private notes.  
It is built with a strong focus on cyber security principles.

## setup

1. Clone the repository  
2. Create a `.env.local` file with:

NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

3. Install dependencies:
   npm install

4. Run the dev server:
   npm run dev

## features
- Email/password authentication
- Row Level Security
- Authorization policies so users only access their own data
- Input validation
- Secure HTTP-only cookies (Supabase)
- Uses TLS (via https)

