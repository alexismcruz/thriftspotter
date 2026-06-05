# Vercel Cron Job Setup Guide

## Goal
Run the product carousel update every night at **9pm Central Time**

---

## Step-by-Step Instructions

### **Step 1: Update `vercel.json` (Already Done ✅)**

The file is already created in your project root with this content:

```json
{
  "crons": [
    {
      "path": "/api/cron/update-products",
      "schedule": "0 2 * * *"
    }
  ]
}
```

**Note about timezone:**
- `0 2 * * *` = 2am UTC = **9pm CDT** (Central Daylight Time, March-November)
- During winter, you'll need `0 3 * * *` = 3am UTC = **9pm CST** (Central Standard Time, November-March)

**Options:**
- **Option A (Recommended):** Use `0 2 * * *` year-round (runs at 9pm CDT in summer, 8pm CST in winter - close enough)
- **Option B (Precise):** Switch between:
  - Summer: `0 2 * * *` (March 12 - November 5 approx)
  - Winter: `0 3 * * *` (November 5 - March 12 approx)

---

### **Step 2: Commit & Push to GitHub**

```bash
git add vercel.json
git commit -m "Add Vercel cron configuration for nightly product updates"
git push origin main
```

---

### **Step 3: Deploy to Vercel**

There are 2 ways to deploy:

#### **Option A: Automatic (GitHub Integration)**
1. Go to https://vercel.com/dashboard
2. Click on your **ThriftSpotter** project
3. Vercel will auto-detect the `vercel.json` changes
4. Wait for automatic deployment to complete
5. ✅ Cron job is now active!

#### **Option B: Manual Deploy**
1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```
2. In your project directory, run:
   ```bash
   vercel --prod
   ```
3. Follow the prompts (should auto-detect your Vercel project)
4. ✅ Cron job is now active!

---

### **Step 4: Verify the Cron Job is Running**

#### **In Vercel Dashboard:**
1. Go to https://vercel.com/dashboard
2. Click on **ThriftSpotter** project
3. Go to **Settings** → **Cron Jobs** (or **Functions**)
4. You should see:
   ```
   ✅ /api/cron/update-products
   Schedule: 0 2 * * * (UTC)
   Status: Active
   ```

#### **Test it Manually (Before 9pm):**
1. Go to your deployed site: https://thriftspotter.com
2. Open browser developer tools (F12)
3. Go to **Console** tab
4. Run:
   ```javascript
   fetch('/api/cron/update-products', { method: 'POST' })
     .then(r => r.json())
     .then(d => console.log(d))
   ```
5. You should see something like:
   ```
   { success: true, count: 10 }
   ```

---

## What Happens at 9pm Central Every Night

1. ✅ Vercel triggers `/api/cron/update-products`
2. ✅ The API randomly selects 10 products from the sample list
3. ✅ Products are inserted into your database
4. ✅ Homepage carousel displays the fresh products
5. ✅ All affiliate links are tracked with your eBay campaign ID

---

## Troubleshooting

### **Cron job doesn't appear in Vercel dashboard**
- Make sure `vercel.json` is in the project root (same level as `package.json`)
- Redeploy: `vercel --prod`
- Wait 30 seconds for dashboard to refresh

### **Getting 401 Unauthorized**
- If you set `CRON_SECRET` env var in `.env`, add it as a header:
  ```javascript
  fetch('/api/cron/update-products', {
    method: 'POST',
    headers: { 'x-cron-secret': 'your-secret-here' }
  })
  ```

### **Products aren't updating**
- Check Vercel Function logs:
  1. Go to Vercel Dashboard → ThriftSpotter
  2. Click **Deployments** → Latest deployment
  3. Go to **Functions** tab
  4. Click on `/api/cron/update-products`
  5. Check the **Logs** for errors

### **Wrong time (off by 1 hour)**
- You're caught between daylight/standard time
- Use the timezone option that matches the current date:
  - **Summer (Mar-Nov):** `0 2 * * *` 
  - **Winter (Nov-Mar):** `0 3 * * *`

---

## Cron Schedule Explanation

The schedule `0 2 * * *` breaks down as:

```
minute | hour | day | month | day-of-week
   0   |  2   |  *  |   *   |     *
```

- `0` = At minute 0 (on the hour)
- `2` = At 2am UTC (9pm CDT)
- `*` = Every day of month
- `*` = Every month
- `*` = Every day of week

Common schedules:
- `0 2 * * *` = Daily at 2am UTC (9pm CDT)
- `0 3 * * *` = Daily at 3am UTC (9pm CST)
- `0 2 * * 0` = Every Sunday at 2am UTC
- `0 2 1 * *` = Monthly on 1st at 2am UTC

[Cron schedule generator](https://crontab.guru/)

---

## Cost

✅ **FREE!** Vercel includes cron jobs on all plans (including free tier).

---

## Next Steps

1. ✅ Update `vercel.json` (done)
2. ✅ Push to GitHub (you'll do this)
3. ✅ Deploy to Vercel (automatic or manual)
4. ✅ Verify in dashboard
5. ✅ Test the endpoint
6. ✅ Wait for 9pm Central tonight to see it run automatically!

---

## Questions?

If cron doesn't start, check:
- [ ] `vercel.json` is in project root
- [ ] File is committed and pushed to GitHub
- [ ] Vercel dashboard shows the deployment is live
- [ ] Vercel shows the cron job as "Active"
- [ ] No errors in Function logs
