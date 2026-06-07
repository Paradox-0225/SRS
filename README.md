# SRS Text-Based Practice Tool

A minimalist, lightweight, and **Fully Portable** vocabulary Practice Tool based on the Spaced Repetition System (SRS). Drop any plain Text File with your Words and start practicing instantly.

## ✨ Why This Project?

This is a tiny weekend Project born out of a Personal need. Many modern vocabulary Applications feel bloated—requiring mandatory installation, registration, or heavy cloud synchronization just to study a simple list of Words.
I wanted something clean, distraction-free, and OffLine-First. This Tool requires zero installation, runs directly in your Browser, and uses no DataBases or Accounts. It’s just a simple way to Practice your Words using **Active ReCall**.

## 🔑 Key Features

* **Portable & OffLine-First:** Runs directly in your Browser from a single Local File. No internet connection or installation required.
* **Private by Design:** Your Data stays on your Computer. There is no backend, no cloud sync, and no tracking.
* **Basic SRS Mechanics:** Automatically prioritizes new or forgotten Words based on your performance during Practice Sessions.
* **KeyBoard Navigation:** Designed for fast Sessions, allowing you to control everything with just a few Keys.
* **Optional KleeOne Font:** InCludes Built-In support for the **KleeOne** Font with customizable rendering modes to display Japanese Characters properly.

## 🌐 Web Version (No Installation Required)

If you don't want to DownLoad anything, you can use the fully functional Web Version hosted on GitHub Pages:<BR>
🔗 **[Open Web App in Browser](https://Paradox-0225.github.io/SRS/)**

---

## 📝 How to Prepare Your Word List

The Tool reads standard `.TXT` Files. Use the Vertical Bar `|` Character as a Separator between the Word/Phrase you are learning and its Translation.

### Initial File Format:
```TEXT
りんご | Apple, Apples
ゲーム | Video Games
アニメ | Anime
```

> 📌 **Note:** Any Line that does not contain the `|` Character is automatically treated as a Comment. You can use this to add personal notes, headers, or structure your File however you like!

---

## ⚙️ How the File UpDates (SRS Mechanics)

Once you complete a Practice Session, the Tool generates an UpDated Text File for you to DownLoad. This File contains your Practice Scores and a Configuration Header at the very Top:

```TEXT
#CONFIG | WORDS: 20 | RATIO: 0.75 | REWARD: 1 | PENALTY: -20 | FONT: 0

りんご | Apple, Apples | 0
ゲーム | Video Games | 2
アニメ | Anime | 16
```

### 1. Word Scores & Progression
The number at the end of each Line represents your current Progress Score:
* **Lower Scores** (new or forgotten Words) have a **much higher probability** of appearing in your next Sessions.
* **Higher Scores** (well-remembered Words) gradually cycle out and appear less frequently.
* **Adding New Words:** Simply type them into your File at any time without a Score. By default, they start at `0` and get prioritized immediately.

### 2. Configuration Settings
You can fine-tune the System by changing the Values in the `#CONFIG` line directly inside your Text File:

| Parameter | Default | Description |
| :---: | :---: | :--- |
| **WORDS** | `20` | Maximum number of Words selected for a single Practice Session.<BR>*(Tip: You can increase this to 100-200 for intensive daily Practice)* |
| **RATIO** | `0.75` | Controls Language direction probability. For example, `0.75` means a 75% chance of showing you the Translation first (requiring you to ReCall the target Language), and a 25% chance of the ReVerse. |
| **REWARD** | `1` | Points added to the Word's internal Score upon a correct Answer (**Remember**). |
| **PENALTY** | `-20` | Points deducted from the Word's Score upon an incorrect Answer (**Forgot**). Drops no lower than 0. |
| **FONT** | `0` | Font rendering mode for **KleeOne** (Japanese Font Compatibility):<BR>`0` = **International:** KleeOne is used ONLY for Japanese Characters.<BR>`1` = **Full:** KleeOne is used for both Japanese and English Text.<BR>`2` = **Disabled:** Universal System Fonts are used everywhere. |

---

## ⌨️ KeyBoard ShortCuts

Navigate your Practice Sessions entirely using your KeyBoard:

* <KBD>🡡 Arrow Up</KBD> / <KBD>🡣 Arrow Down</KBD> — Reveal the Answer.
* <KBD>🡠 Arrow Left</KBD> — Mark as **Forgot** (Apply Penalty).
* <KBD>🡢 Arrow Right</KBD> — Mark as **Remembered** (Apply Reward).

---

## 💾 Local Installation

To use the Tool completely OffLine:

1. Download the latest Package from the **Releases** Section.
2. UnPack the `.ZIP` Archive.
3. Double-Click `Index.HTML` to launch the App instantly in your Browser.

---

## ☕ Support

🔗 **[Buy Me a Coffee (DonationAlerts)](https://www.donationalerts.com/r/5050505050505050)**

---

## 📄 License

This Project is Open-Source and available under the **MIT License**.
