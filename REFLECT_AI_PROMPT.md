# Reflect.run AI Test Prompt - Meta Ads Dashboard Demo

## 🤖 Copy and Paste This Prompt into Reflect.run

```
Create a test that demonstrates a Meta Ads analytics dashboard for app review submission.

Starting URL: https://ads-cw.vercel.app

Test Steps:

1. Wait for page to load completely (wait for table with ads to appear)

2. Scroll down slowly through the ads table to show multiple ads with metrics (impressions, clicks, CTR, spend, leads)

3. Click on the first ad row in the table to open the details modal

4. Wait for modal to open and display ad details

5. Scroll down inside the modal to show all metrics and creative preview

6. Wait 3 seconds

7. Click outside the modal or on the close button to close it

8. Wait for modal to close

9. Locate and click on the status filter dropdown (if visible)

10. Select "Active" or first option in the filter

11. Wait for table to update with filtered results

12. Wait 2 seconds

13. Click on another ad row to open details modal again

14. Wait for modal to open

15. Wait 3 seconds to show engagement metrics

16. Close the modal

17. Wait 2 seconds

18. End test

Keep all actions simple and wait for elements to be visible before interacting.
Focus on demonstrating read-only data viewing capabilities.
```

---

## 📋 Alternative: Step-by-Step Manual Instructions

If the AI prompt doesn't work well, use Reflect's manual recording mode:

### Setup in Reflect.run

1. **Create New Test**
   - Test Name: `Meta Ads Dashboard - Permission Demo`
   - Starting URL: `https://ads-cw.vercel.app`
   - Click **"Record Manually"** (not AI mode)

### Recording Steps

#### Step 1: Initial Load (5 seconds)
- **Action**: Wait for page load
- **What to verify**: Table with ads appears
- **Reflect action**: Add assertion "Element is visible" for the ads table

#### Step 2: Show Ads List (10 seconds)
- **Action**: Scroll down slowly
- **Reflect action**: Add "Scroll" action, distance: 500px, smooth: true
- **Wait**: 2 seconds

#### Step 3: Open Ad Details (5 seconds)
- **Action**: Click first ad row
- **Reflect action**: Click on element with selector: `table tbody tr:first-child`
- **Wait**: Modal to appear

#### Step 4: Show Ad Details (10 seconds)
- **Action**: Scroll inside modal
- **Reflect action**: Scroll within modal element
- **Wait**: 3 seconds
- **Action**: Take screenshot (optional)

#### Step 5: Close Modal (3 seconds)
- **Action**: Click close button or outside modal
- **Reflect action**: Click close button
- **Wait**: Modal to disappear

#### Step 6: Apply Filter (8 seconds)
- **Action**: Click status filter
- **Reflect action**: Click filter dropdown
- **Action**: Select "Active"
- **Wait**: Table to update

#### Step 7: Show Filtered Results (5 seconds)
- **Action**: Wait and observe
- **Wait**: 2 seconds

#### Step 8: Open Another Ad (8 seconds)
- **Action**: Click another ad row
- **Reflect action**: Click on `table tbody tr:nth-child(2)`
- **Wait**: Modal to appear
- **Wait**: 3 seconds

#### Step 9: Close and Finish (3 seconds)
- **Action**: Close modal
- **Action**: End recording

**Total Duration**: ~60 seconds of actual recording

---

## 🎯 Simplified Prompt for Reflect AI (Version 2)

If the first prompt is too complex, try this simpler version:

```
Test a Meta Ads dashboard at https://ads-cw.vercel.app

Steps:
1. Load the page and wait for ads table
2. Scroll down to show multiple ads
3. Click the first ad row
4. Wait 3 seconds
5. Close the modal
6. Click another ad row
7. Wait 3 seconds
8. Close the modal
9. End test

Make all actions slow and clear for video demonstration.
```

---

## 🎬 Best Approach: Use Reflect's Chrome Extension

Instead of AI prompts, use Reflect's Chrome extension for best results:

### Method 1: Chrome Extension Recording

1. **Install Reflect Chrome Extension**
   - Go to: https://reflect.run/
   - Click "Install Chrome Extension"
   - Or search "Reflect" in Chrome Web Store

2. **Start Recording**
   - Open extension
   - Click "Start Recording"
   - Navigate to: https://ads-cw.vercel.app

3. **Perform Actions Naturally**
   - Just use the site normally
   - Reflect records everything automatically
   - Click, scroll, type - all captured

4. **Stop Recording**
   - Click extension icon
   - Click "Stop Recording"
   - Test is automatically created

5. **Export Video**
   - Run the test
   - Export as video

### Method 2: Use OBS Studio Instead (Recommended)

Since Reflect is having issues, use OBS Studio for professional recording:

**Why OBS is Better:**
- ✅ No compatibility issues
- ✅ Professional quality
- ✅ Full control
- ✅ Free and open source
- ✅ Works with any website

**Quick OBS Setup:**

1. **Download**: https://obsproject.com/
2. **Install** and open OBS
3. **Add Source**:
   - Click "+" in Sources
   - Select "Display Capture" (full screen) or "Window Capture" (browser only)
   - Select your browser window
4. **Settings**:
   - Settings > Video
   - Base Resolution: 1920x1080
   - Output Resolution: 1920x1080
   - FPS: 30
5. **Start Recording**:
   - Click "Start Recording"
   - Perform the demo following the script
   - Click "Stop Recording"
6. **Find Video**:
   - File > Show Recordings
   - Video saved as MP4

---

## 📝 Simple Manual Script for OBS Recording

Follow this script while recording with OBS:

### Scene 1: Dashboard Load (10 sec)
- Open browser
- Type: `https://ads-cw.vercel.app`
- Press Enter
- Wait for page to load
- Pause 3 seconds

### Scene 2: Browse Ads (15 sec)
- Scroll down slowly
- Show different ads
- Pause to show metrics
- Scroll back up

### Scene 3: Ad Details (20 sec)
- Click on an ad row
- Wait for modal
- Scroll in modal
- Show creative and metrics
- Pause 3 seconds
- Close modal

### Scene 4: Filters (15 sec)
- Click status filter
- Select "Active"
- Wait for update
- Show filtered results

### Scene 5: Another Ad (15 sec)
- Click different ad
- Show modal
- Pause 3 seconds
- Close modal

### Scene 6: End (5 sec)
- Show full dashboard
- End recording

**Total**: ~80 seconds (1min 20sec)

---

## ✅ Recommendation

**Use OBS Studio** instead of Reflect.run:

**Pros:**
- No compatibility issues
- Works perfectly every time
- Professional quality
- Full control over recording
- Free

**Cons:**
- Manual recording (but following script is easy)
- Need to download software (but it's free)

**Time to setup OBS**: 5 minutes  
**Time to record**: 2 minutes  
**Total**: 7 minutes to have perfect video

---

## 🆘 Quick Decision Guide

**If you want automation**: Try Reflect Chrome Extension (Method 1)  
**If you want reliability**: Use OBS Studio (Method 2) ⭐ RECOMMENDED  
**If you want to try AI**: Use Simplified Prompt (Version 2)

---

Would you like me to create a detailed OBS Studio setup guide? It's actually easier and more reliable than Reflect for this use case! 🎥
