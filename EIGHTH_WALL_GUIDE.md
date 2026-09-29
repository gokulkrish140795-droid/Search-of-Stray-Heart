# 8th Wall WebAR Integration Guide
## Project AR: The Search for a Stray Heart

This guide provides an exact, step-by-step walkthrough for setting up **Niantic 8th Wall** Image Target Tracking and connecting it to the React application.

---

### Phase 1: Create an 8th Wall Account & Workspace

1. **Sign Up:**
   - Go to [https://www.8thwall.com](https://www.8thwall.com).
   - Click **Get Started** / **Sign Up** and create an account.
2. **Select Account Type:**
   - For private/personal development, select the free Developer / Pro-trial tier.
3. **Create a Workspace:**
   - Name your workspace: `gokul-projects` (or any name you prefer).

---

### Phase 2: Create a New WebAR Project & Get Your App Key

1. **Create New Project:**
   - In your 8th Wall Dashboard, click **Create New Project**.
   - Choose **Self-Hosted (Client-Only / API Key)**.
     *(Note: Do NOT choose 8th Wall Cloud Studio/Cloud Editor. Choose **Self-Hosted** because our React + Vite app is already built and hosted).*
2. **Add Authorized Domains (Crucial Step):**
   - 8th Wall verifies domain origin for security. Under **Project Settings -> Domain Whitelist / App Keys**:
   - Add your local development port: `localhost:3000` and `localhost:5173`.
   - Add your Cloud Run / Production domains:
     - `ais-dev-eah3oppeqkoxzjjx4lbau7-573923461244.asia-east1.run.app`
     - `ais-pre-eah3oppeqkoxzjjx4lbau7-573923461244.asia-east1.run.app`
     - Any custom domain (if you plan to use one, e.g. `aishwarya30.com`).
3. **Copy the App Key:**
   - 8th Wall will generate an **App Key** (a 30-character alphanumeric string like `abc123xyz...`).
   - Copy and keep this key handy.

---

### Phase 3: Prepare and Upload Card Image Targets

8th Wall needs to compile reference data for the 27 physical cards.

1. **Card Photo Specifications:**
   - Crop strictly to the **photo artwork** portion of each card (or the entire card if the borders are distinctive).
   - Format: `.png` or `.jpg` (High resolution: at least 600x600px, under 5MB).
   - High contrast, distinctive edges give the fastest tracking lock.
2. **Upload Targets in 8th Wall Dashboard:**
   - Open your project on 8th Wall and click **Image Targets** in the left sidebar.
   - Click **Add Target** -> **Upload Image**.
   - **Name Format (Strict Matching):**
     Set the target name exactly matching our data structure:
     - Card 01 -> `card-01`
     - Card 02 -> `card-02`
     - Card 03 -> `card-03`
     - ...up to `card-29`.
   - **Physical Size:**
     Enter the approximate real-world width of your physical card (e.g., `0.10` meters for a 10cm wide card).
3. **Verify Target Quality:**
   - 8th Wall displays a star rating (1 to 5 stars) for trackability. 3+ stars will track instantly in living-room light.

---

### Phase 4: What We Will Do Together Next (Code Integration)

Once you provide your **App Key**, I will wire it into the project automatically:

1. **Configure Environment Variable:**
   Add `VITE_8THWALL_APP_KEY=your_key_here` to `.env.example`.
2. **Update `index.html`:**
   Inject the official 8th Wall XR Web runtime script:
   ```html
   <script crossorigin="use-credentials" src="//apps.8thwall.com/xrweb?appKey=YOUR_KEY"></script>
   ```
3. **Switch Engine in `src/utils/arEngine.ts`:**
   Activate the 8th Wall camera pipeline module so that:
   - When Aishwarya points her camera at Card #01, 8th Wall fires `onImageFound`.
   - The app instantly plays the chime (`sfx_revelio_bell`), uncovers the 3 letters (`M - I - X`), and reveals Gokul's romantic message on the screen!
4. **Preserve Fallbacks:**
   The `[Enter Code]` manual button will always stay active as a backup, ensuring zero interruptions during the birthday hunt.

---

### Summary Checklist Before Returning:
- [ ] 8th Wall account created.
- [ ] Self-Hosted project created.
- [ ] Whitelisted domains added (`localhost` & `*.run.app`).
- [ ] App Key copied.
- [ ] (Optional) Card photos uploaded as `card-01`, `card-02`, etc.

Come back and share your **App Key**, and we will execute Phase 4 in minutes!
