# ASA Student Portal

Custom student dashboard for the Agency Scaling Accelerator program.

## Features

- **Magic Link Auth** - Students log in via email link (no passwords)
- - **Dashboard** - Overview of MRR, pipeline, email metrics
  - - **Pipeline Tracker** - Track leads from positive reply → close
    - - **Client Management** - Track active clients and revenue
      - - **Email Metrics** - Auto-pulls from Instantly/Smartlead/etc
        - - **Stripe Integration** - Handles payments, access control
         
          - ## Tech Stack
         
          - - **Next.js 14** - React framework
            - - **Airtable** - Database (your existing base)
              - - **Stripe** - Payments & subscriptions
               
                - ## Setup
               
                - ### 1. Environment Variables
               
                - Create `.env.local`:
               
                - ```env
                  AIRTABLE_API_KEY=your_airtable_api_key
                  AIRTABLE_BASE_ID=appV6kChAuYyjTXbe
                  STRIPE_SECRET_KEY=sk_live_...
                  STRIPE_WEBHOOK_SECRET=whsec_...
                  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
                  NEXT_PUBLIC_URL=https://yourdomain.com
                  RESEND_API_KEY=re_...
                  ```

                  ### 2. Install & Run

                  ```bash
                  npm install
                  npm run dev
                  ```

                  ### 3. Deploy to Vercel

                  ```bash
                  npm i -g vercel
                  vercel
                  ```

                  ## Cost

                  **Total: $0/month** (until you scale past free tiers)
