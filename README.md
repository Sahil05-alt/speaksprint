# 🎤 SpeakSprint

**SpeakSprint** is a modern daily speaking practice app that helps you become a more confident public speaker — one 60-second challenge at a time.

🌐 **Live Demo:** [app-sigma-five-24.vercel.app](https://app-sigma-five-24.vercel.app)

---

## ✨ Features

### 🎯 Random Topic Generator
- 90 carefully curated topics across **3 difficulty levels**
- Easy (everyday topics), Medium (social & professional), Hard (philosophical & technical)
- Instantly generate a new topic with one click

### ⏱️ 60-Second Speaking Challenge
- Animated **SVG circular countdown timer** with a live progress ring
- 3-2-1 animated countdown before each session begins
- Pause, resume, or finish early — full session control
- Timer ring turns **red** in the last 10 seconds

### 🎙️ Audio Recording
- Records your voice using the browser's **MediaRecorder API**
- Playback immediately after finishing your session
- Audio recordings saved to browser history for later review

### 🎥 Video Recording *(New)*
- Switch between **Audio-only** or **Audio + Video** before starting
- Live **mirrored camera preview** during your session
- Blinking `REC` badge overlay while recording
- Review your video immediately after the session

### 📊 Progress Dashboard
- **KPI cards**: Total sessions, current streak, best streak, total points
- **7-day activity bar chart** showing daily session frequency
- **Difficulty breakdown** with animated progress bars (Easy / Medium / Hard)
- **Next badge** progress indicator

### 🏅 Gamification & Badges
- Earn **points** per session: Easy = 10 pts, Medium = 20 pts, Hard = 35 pts
- **9 achievement badges** to unlock:

| Badge | Requirement |
|---|---|
| 🎤 First Step | Complete 1 session |
| 🔥 Warm Up | Complete 5 sessions |
| 🎙️ Speaker | Complete 25 sessions |
| 🏆 Orator | Complete 100 sessions |
| ⚡ 3-Day Streak | Practice 3 days in a row |
| 🗓️ Week Warrior | Practice 7 days in a row |
| 👑 Legend | Practice 30 days in a row |
| 💯 Century | Earn 100 points |
| 💎 Challenge Ace | Complete a Hard difficulty session |

### 📂 Session History
- Browse all past sessions with **search** and **difficulty filter**
- Expandable session cards with **audio playback**
- Delete individual sessions
- Shows date, time, difficulty, and points earned

### 🌗 Dark / Light Mode
- Vercel-inspired **black & white monochrome** theme
- Smooth transition between **dark** (default) and **light** modes
- Theme persists across sessions

### 📱 Responsive Design
- Full **mobile support** with bottom navigation bar
- Optimized for all screen sizes (mobile, tablet, desktop)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Routing | React Router v6 |
| Icons | Lucide React |
| Styling | Vanilla CSS (custom design system) |
| Fonts | Inter + Space Grotesk (Google Fonts) |
| Audio/Video | Web MediaRecorder API |
| Storage | Browser `localStorage` |
| Mobile | Capacitor (Android APK) |
| Deployment | Vercel |

---

## 📁 Project Structure

```
speaksprint/
├── public/
├── src/
│   ├── context/
│   │   └── AppContext.jsx      # Global state (sessions, streaks, badges, theme)
│   ├── data/
│   │   └── words.js            # 90 topics + badge & points config
│   ├── components/
│   │   ├── Navbar.jsx          # Top navbar + mobile bottom nav
│   │   ├── Navbar.css
│   │   ├── Timer.jsx           # Animated SVG circular countdown
│   │   └── Timer.css
│   ├── pages/
│   │   ├── Home.jsx            # Landing page with stats & features
│   │   ├── Home.css
│   │   ├── Challenge.jsx       # Main speaking session page
│   │   ├── Challenge.css
│   │   ├── Dashboard.jsx       # Progress stats & badge grid
│   │   ├── Dashboard.css
│   │   ├── History.jsx         # Session history + audio replay
│   │   └── History.css
│   ├── App.jsx                 # Router + theme injection
│   ├── main.jsx               # Entry point
│   └── index.css              # Design system tokens + global styles
├── android/                    # Capacitor Android project
├── capacitor.config.json       # Capacitor configuration
├── index.html
├── vite.config.js
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+ and npm
- A modern browser (Chrome, Firefox, Edge, Safari)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/speaksprint.git
cd speaksprint

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start local development server |
| `npm run build` | Build for production (outputs to `dist/`) |
| `npm run preview` | Preview the production build locally |

---

## 📱 Android App (Capacitor)

SpeakSprint can be packaged as a native Android APK using [Capacitor](https://capacitorjs.com/).

### Requirements
- [Android Studio](https://developer.android.com/studio) installed

### Build Steps

```bash
# 1. Build the web app
npm run build

# 2. Sync web assets to Android project
npx cap sync android

# 3. Open in Android Studio
npx cap open android
```

In Android Studio:
- Go to **Build → Build Bundle(s) / APK(s) → Build APK(s)**
- Your APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

### Updating the App

After any code changes:
```bash
npm run build
npx cap sync android
# Then rebuild in Android Studio
```

### Play Store Release

In Android Studio, use **Build → Generate Signed Bundle/APK** to create a release-signed APK or AAB for Play Store submission.

---

## 🌐 Deploying to Vercel

### One-command deploy (Vercel CLI)

```bash
# Install Vercel CLI (first time only)
npm install -g vercel

# Login to Vercel (first time only)
vercel login

# Deploy to production
vercel --prod --yes
```

### Vercel Dashboard Deployment

1. Push your code to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import your GitHub repository
4. Vercel auto-detects Vite — click **Deploy**

Vercel will automatically redeploy on every push to your main branch.

---

## 🔧 Configuration

### Adding Topics

Edit `src/data/words.js` to add topics to any difficulty tier:

```js
export const TOPICS = {
  easy:   [ "Home", "Food", "Friends", /* add here */ ],
  medium: [ "Leadership", "Innovation", /* add here */ ],
  hard:   [ "Existentialism", /* add here */ ],
};
```

### Adding Badges

Add to the `BADGES` array in `src/data/words.js`:

```js
export const BADGES = [
  // ...existing badges
  {
    id: "unique_id",
    label: "Badge Name",
    icon: "🎯",
    description: "Requirement description",
    requirement: 10,
    type: "sessions" // sessions | streak | points | hard_sessions
  },
];
```

### Points per Session

```js
export const POINTS_PER_SESSION = { easy: 10, medium: 20, hard: 35 };
```

---

## 🗺️ Roadmap

- [ ] AI feedback on speech (filler words, clarity, confidence)
- [ ] Video recordings saved to cloud storage
- [ ] Custom topic input
- [ ] Shareable session results
- [ ] iOS app (Capacitor)
- [ ] Weekly challenge mode
- [ ] Speech-to-text transcript

---

## 📄 License

This project is licensed under the **MIT License** — feel free to use, modify, and distribute.

---

## 🙌 Acknowledgements

- [Capacitor](https://capacitorjs.com/) for the Android packaging
- [Lucide](https://lucide.dev/) for the icon set
- [Google Fonts](https://fonts.google.com/) for Inter & Space Grotesk
- Inspired by [Vercel's](https://vercel.com) clean design language

---

<p align="center">Made with ❤️ to help the world speak better, one minute at a time.</p>
