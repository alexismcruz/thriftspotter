# Affiliate IDs Update Guide

Once you create affiliate accounts with each platform, update the URLs in `src/app/shop-online/page.tsx` with your affiliate IDs.

---

## **How to Update Each Platform**

### **1. Depop**
- **Current URL:** `https://www.depop.com/?utm_source=thriftspotter`
- **After signup:** Apply through Awin or ShareASale
- **Update to:** Add your referral code/link from Depop
- **Example:** `https://www.depop.com/ref=YOURCODE`

### **2. Vinted**
- **Current URL:** `https://www.vinted.com/?utm_source=thriftspotter`
- **After signup:** Get affiliate link from vinted.com/affiliates
- **Update to:** Replace with your Vinted affiliate link
- **Example:** `https://www.vinted.com/r/YOURCODE`

### **3. Mercari**
- **Current URL:** `https://www.mercari.com/?utm_source=thriftspotter`
- **After signup:** Get affiliate link from mercari.com/affiliates
- **Update to:** Replace with your Mercari affiliate link
- **Example:** `https://www.mercari.com/?utm_source=YOURCODE`

### **4. Etsy**
- **Current URL:** `https://www.etsy.com/search/vintage?utm_source=thriftspotter`
- **After signup:** Get affiliate ID from etsy.com/affiliates
- **Update to:** Add your affiliate tag
- **Example:** `https://www.etsy.com/search/vintage?ref=YOURCODE`

### **5. Grailed**
- **Current URL:** `https://www.grailed.com/?utm_source=thriftspotter`
- **After signup:** Get affiliate link from grailed.com/affiliates
- **Update to:** Replace with your Grailed affiliate link
- **Example:** `https://www.grailed.com/?utm_source=YOURCODE`

### **6. The RealReal**
- **Current URL:** `https://www.therealreal.com/?utm_source=thriftspotter`
- **After signup:** Get affiliate link from therealreal.com/affiliates
- **Update to:** Replace with your RealReal affiliate link
- **Example:** `https://www.therealreal.com/?src=YOURCODE`

### **7. Vestiaire Collective**
- **Current URL:** `https://www.vestiairecollective.com/?utm_source=thriftspotter`
- **After signup:** Get affiliate link from vestiairecollective.com/affiliates
- **Update to:** Replace with your Vestiaire affiliate link
- **Example:** `https://www.vestiairecollective.com/?utm_source=YOURCODE`

### **8. eBay** (Already set)
- **Current URL:** `https://ebay.com/sch/i.html?_nkw=vintage+secondhand&campid=7372111`
- **Status:** ✅ Ready to go with campaign ID 7372111

### **9. Amazon** (Already set)
- **Current URL:** `https://www.amazon.com/second-chance?tag=thriftspotter-20`
- **Status:** ✅ Ready to go with affiliate ID thriftspotter-20

---

## **Steps to Update URLs**

1. **Sign up for each affiliate program** (see "Affiliate Program Links" below)
2. **Get your affiliate links/IDs**
3. **Open** `src/app/shop-online/page.tsx`
4. **Find** the `PLATFORMS` array
5. **Replace** the `url:` value for each platform
6. **Test** that links work by clicking them
7. **Commit & push** to GitHub
8. **Deploy** to Vercel

---

## **Affiliate Program Signup Links**

- **Depop:** https://www.depop.com/partners/affiliates/ (or Awin/ShareASale)
- **Vinted:** https://www.vinted.com/affiliates
- **Mercari:** https://www.mercari.com/affiliates
- **Etsy:** https://affiliates.etsy.com
- **Grailed:** https://www.grailed.com/affiliates
- **The RealReal:** https://www.therealreal.com/affiliates
- **Vestiaire Collective:** https://www.vestiairecollective.com/affiliates

---

## **Expected Commissions**

| Platform | Commission | Best For |
|----------|-----------|----------|
| Depop | 7-10% | Fashion, streetwear |
| Vinted | 5-8% | Clothing, accessories |
| Mercari | 7-10% | Broad secondhand |
| Etsy | 5% | Vintage, unique items |
| Grailed | 5-10% | Menswear, sneakers |
| The RealReal | 8-12% | Luxury items |
| Vestiaire | 5-10% | Designer fashion |
| eBay | 7-10% | Broad categories |
| Amazon | 3-5% | Electronics, home |

---

## **Quick Update Template**

When you get your affiliate links, just replace the `url` value:

```javascript
// BEFORE
{
  name: "Depop",
  url: "https://www.depop.com/?utm_source=thriftspotter",
},

// AFTER
{
  name: "Depop",
  url: "https://www.depop.com/ref=YOUR_AFFILIATE_CODE_HERE",
},
```

---

## **Testing Your Links**

After updating:
1. Run `npm run dev` locally
2. Go to http://localhost:3000/shop-online
3. Click each platform card
4. Verify the link includes your affiliate code/ID
5. Confirm you can see your affiliate dashboard tracking clicks

---

## **Need Help?**

If you get stuck on any affiliate signup:
1. Go to the platform's affiliates page (links above)
2. Look for "Contact Support" or "Help"
3. Ask them for the correct URL format for your affiliate links

Once you have all your affiliate IDs, send them to me and I can update all the URLs at once! 🚀
