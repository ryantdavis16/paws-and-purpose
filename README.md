# 🐾 Paws & Purpose

A non-profit website + tracker for donating pet supplies to animal shelters.

## Site Structure

```
paws-and-purpose/
├── index.html        ← Public-facing website
├── tracker.html      ← Private tracker app
├── css/
│   ├── style.css     ← Shared styles
│   └── tracker.css   ← Tracker-specific styles
├── js/
│   ├── storage.js    ← Shared data storage (localStorage)
│   ├── website.js    ← Website logic
│   └── tracker.js    ← Tracker logic
└── README.md
```

## How to Publish on GitHub Pages

### Step 1 — Create a GitHub account
Go to [github.com](https://github.com) and sign up for a free account if you don't have one.

### Step 2 — Create a new repository
1. Click the **+** button in the top right → **New repository**
2. Name it: `paws-and-purpose` (or anything you like)
3. Set it to **Public**
4. Click **Create repository**

### Step 3 — Upload the files
1. On your new repo page, click **uploading an existing file**
2. Drag ALL the files and folders from this ZIP into the upload area:
   - `index.html`
   - `tracker.html`
   - `css/` folder (with both CSS files)
   - `js/` folder (with all JS files)
3. Scroll down and click **Commit changes**

### Step 4 — Enable GitHub Pages
1. Go to your repo's **Settings** tab
2. Scroll down to **Pages** in the left sidebar
3. Under **Source**, select **Deploy from a branch**
4. Choose **main** branch and **/ (root)** folder
5. Click **Save**

### Step 5 — Your site is live! 🎉
After about 1–2 minutes, your site will be live at:
```
https://YOUR-GITHUB-USERNAME.github.io/paws-and-purpose/
```

The tracker will be at:
```
https://YOUR-GITHUB-USERNAME.github.io/paws-and-purpose/tracker.html
```

## How the Live Sync Works

Data entered in the **Tracker** is saved to your browser's `localStorage`. The **Website** reads from the same storage on every page load — so anything added in the Tracker appears on the website automatically.

> **Note:** Because localStorage is browser-specific, the tracker and website must be used on the **same device and browser** to share data. To share across devices in the future, consider upgrading to a free backend like [Firebase](https://firebase.google.com) or [Supabase](https://supabase.com).

## Customization

- **Name & colors** → Edit `css/style.css` (CSS variables at the top of the file)
- **Sample data** → Edit the `defaults` object in `js/storage.js`
- **Add your email** → Search for `contact@pawsandpurpose.org` in `index.html` and replace

---
Made with ❤️ for animals everywhere. 🐾
