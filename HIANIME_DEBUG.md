# HiAnime Integration Debug Guide

## What Should Happen

1. When you visit the anime watch page, you should see "HiAnime" as the first source
2. When you click on "HiAnime", it should load sub-options with different qualities
3. The sub-options should appear directly under the HiAnime button

## How to Test

1. Visit: http://localhost:3002/anime/182896/watch?episode=1&src=0
2. Look for the "HiAnime" source in the left sidebar
3. Click on "HiAnime"
4. Check the browser console for this message: "✅ Loaded HiAnime options: X players"
5. Look for sub-options appearing under the HiAnime button

## Expected Console Output

```
✅ Loaded HiAnime options: 2 players
Generated 2 HiAnime players: [...]
```

## Current Status

- ✅ HiAnime API search working
- ✅ Episodes API working
- ✅ Servers API working  
- ✅ Stream API working (FIXED!)
- ✅ Frontend should now show HiAnime options

## What Was Fixed

The stream API was returning the wrong data structure. The HiAnime API returns streaming data directly in `data`, but our API was trying to access `data.streamingLink`. Fixed the API to properly map the response structure.

## What to Check in Browser Console

1. Open browser console (F12)
2. Go to anime watch page
3. Click on HiAnime source
4. Look for console messages starting with ✅ or ❌

## If No Options Appear

Check these things:
1. Is the "✅ Loaded HiAnime options" message in console?
2. What is the number of players loaded?
3. Are there any error messages in console?
4. Are there any 404 or 500 errors in the Network tab?

