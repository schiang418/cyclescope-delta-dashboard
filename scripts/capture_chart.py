#!/usr/bin/env python3
"""
Chart Screenshot Capture Script  
Captures ONLY the chart area from StockCharts.co URLs (cropped)
"""

import sys
import json
import time
import base64
from io import BytesIO
from PIL import Image
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def setup_driver():
    """Setup Chrome driver with headless options"""
    import os
    import glob
    import sys
    
    # Log environment info for debugging
    print(f"DEBUG: Python version: {sys.version}", file=sys.stderr)
    print(f"DEBUG: Working directory: {os.getcwd()}", file=sys.stderr)
    print(f"DEBUG: /nix/store exists: {os.path.exists('/nix/store')}", file=sys.stderr)
    
    chrome_options = Options()
    chrome_options.add_argument('--headless=new')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--window-size=1920,1080')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--disable-software-rasterizer')
    chrome_options.add_argument('--disable-extensions')
    chrome_options.add_argument('--disable-setuid-sandbox')
    chrome_options.add_argument('--single-process')
    chrome_options.add_argument('--disable-background-networking')
    chrome_options.add_argument('--disable-default-apps')
    chrome_options.add_argument('--disable-sync')
    chrome_options.add_argument('--disable-translate')
    chrome_options.add_argument('--hide-scrollbars')
    chrome_options.add_argument('--metrics-recording-only')
    chrome_options.add_argument('--mute-audio')
    chrome_options.add_argument('--no-first-run')
    chrome_options.add_argument('--safebrowsing-disable-auto-update')
    chrome_options.add_argument('--ignore-certificate-errors')
    chrome_options.add_argument('--ignore-ssl-errors')
    chrome_options.add_argument('--ignore-certificate-errors-spki-list')
    chrome_options.add_argument('--disable-blink-features=AutomationControlled')
    
    # Set binary location if in Railway environment
    import os
    import glob
    
    # Try to find Chrome/Chromium binary
    if os.path.exists('/nix/store'):
        # Nixpacks environment - find chromium binary
        chromium_paths = glob.glob('/nix/store/*/bin/chromium')
        if chromium_paths:
            chrome_options.binary_location = chromium_paths[0]
        else:
            # Try chrome as well
            chrome_paths = glob.glob('/nix/store/*/bin/chrome')
            if chrome_paths:
                chrome_options.binary_location = chrome_paths[0]
    
    driver = webdriver.Chrome(options=chrome_options)
    return driver

def capture_chart_screenshot(url, output_path=None):
    """
    Capture and crop only the chart area from StockCharts URL
    Returns base64 encoded PNG data
    """
    driver = setup_driver()
    
    try:
        # Navigate to chart
        driver.get(url)
        
        # Wait for page to load
        try:
            WebDriverWait(driver, 15).until(
                EC.presence_of_element_located((By.TAG_NAME, "canvas"))
            )
        except:
            pass
        
        # Additional wait for chart rendering
        time.sleep(3)
        
        # Take full page screenshot
        screenshot_png = driver.get_screenshot_as_png()
        
        # Open with PIL to crop
        img = Image.open(BytesIO(screenshot_png))
        
        # Crop coordinates to keep chart with title/data but remove site navigation
        # Based on user examples: keep chart title, price data, and graph
        # Remove only the blue StockCharts.com navigation bar at top
        width, height = img.size
        
        # Crop: left, top, right, bottom  
        # Remove navigation and menus (~260px from top based on user examples)
        # Keep: gray chart title bar, price data, chart canvas, and bottom timeline
        crop_box = (0, 260, width, height)
        cropped_img = img.crop(crop_box)
        
        # Convert to PNG bytes
        output_buffer = BytesIO()
        cropped_img.save(output_buffer, format='PNG')
        cropped_png = output_buffer.getvalue()
        
        # Convert to base64
        screenshot_base64 = base64.b64encode(cropped_png).decode('utf-8')
        
        # If output path specified, save to file
        if output_path:
            with open(output_path, 'wb') as f:
                f.write(cropped_png)
        
        return screenshot_base64
        
    finally:
        driver.quit()

def main():
    """
    Main function - accepts chart URL
    Returns JSON output with result
    """
    if len(sys.argv) < 2:
        print(json.dumps({
            "success": False,
            "error": "Missing chart URL argument"
        }))
        sys.exit(1)
    
    url = sys.argv[1]
    output_path = sys.argv[2] if len(sys.argv) > 2 else None
    
    try:
        screenshot_data = capture_chart_screenshot(url, output_path)
        
        result = {
            "success": True,
            "imageData": screenshot_data,
            "outputPath": output_path
        }
        
        print(json.dumps(result))
        sys.exit(0)
        
    except Exception as e:
        result = {
            "success": False,
            "error": str(e)
        }
        print(json.dumps(result))
        sys.exit(1)

if __name__ == "__main__":
    main()

