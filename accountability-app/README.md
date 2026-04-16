# AccountabilityOS — Mobile App

React Native app built with Expo. Connects to the live Railway backend.

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Start Expo

```bash
npx expo start
```

### 3. Open on your phone

- Install **Expo Go** from the App Store or Google Play
- Make sure your phone and Mac are on the **same WiFi**
- Scan the QR code shown in the terminal with your camera (iOS) or the Expo Go app (Android)

---

## What You'll See

### Today Tab
- Lock / Unlock status badge
- Screen time minutes remaining
- Daily score (points earned today)
- **Level picker** — set your difficulty for the day (Off / Survival / Standard / Relentless)
- **Activity buttons** — tap to log Workout (+30), LeetCode (+30), Job Apply (+25)
- **Reading button** — opens a modal where you describe what you studied; evidence is verified by the NLP pipeline before points are awarded

### Weekly Tab
- Current streak (consecutive active days)
- 7-day bar chart showing each day's level
- Distribution grid showing how many days at each level

---

## Troubleshooting

**App shows "Loading..." indefinitely**
- Check your WiFi — phone and Mac must be on the same network
- Make sure the backend is up: open `https://accountability-os-production.up.railway.app/` in a browser, you should see `AccountabilityOS Server is running!`

**Reading verification fails**
- Be specific in the evidence field — describe what you actually learned, not just what topic you covered
- The NLP model checks semantic similarity between your claim and evidence

**Score doesn't update**
- The app polls the server every 30 seconds — wait a moment after logging an activity
- Or pull down to background the app and reopen it to force a refresh
