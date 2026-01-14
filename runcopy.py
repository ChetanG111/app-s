import cv2
import numpy as np
import json
from pathlib import Path
import argparse

# ==========================================
# CONFIGURATION
# ==========================================
# Mask softening (higher = softer edges, but less sharp)
MASK_BLUR_RADIUS = 3 

# ==========================================
# HELPER FUNCTIONS
# ==========================================

def get_refined_mask(image):
    """
    Generates a clean, slightly expanded alpha mask from the green screen.
    """
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    
    # 1. Strict Green Detection (Kept your preferred settings)
    lower = np.array([35, 100, 50])
    upper = np.array([85, 255, 255])
    mask = cv2.inRange(hsv, lower, upper)
    
    # 2. Clean Noise
    kernel = np.ones((3,3), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
    
    # 3. DILATE: The 'Breakage' Fix
    # Expand the white area (screen) into the dark bezel.
    mask = cv2.dilate(mask, kernel, iterations=2)
    
    # 4. Feathering
    mask = cv2.GaussianBlur(mask, (MASK_BLUR_RADIUS, MASK_BLUR_RADIUS), 0)
    
    return mask

# ==========================================
# MAIN PROCESSING
# ==========================================

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--screenshot', type=str, required=True)
    parser.add_argument('--reset', action='store_true', help="Ignore saved layout.json")
    args = parser.parse_args()

    shot = cv2.imread(args.screenshot)
    if shot is None:
        print(f"❌ Could not load screenshot: {args.screenshot}")
        return

    templates_dir = Path('./templates')
    output_dir = Path('./output')
    output_dir.mkdir(exist_ok=True)
    
    layout_file = templates_dir / "layout.json"
    layout = {}
    
    # Load existing layout if available
    if layout_file.exists() and not args.reset:
        try:
            with open(layout_file, 'r') as f: layout = json.load(f)
            print("Loaded layout.json")
        except: 
            print("⚠️ Error loading layout.json, starting fresh.")
            layout = {}

    for t_path in templates_dir.glob('*.png'):
        t_name = t_path.stem
        
        # 1. Get Coordinates
        if t_name in layout:
            corners = np.array(layout[t_name], dtype=np.float32)
        else:
            print(f"⚠️ No layout found for {t_name}. Please run calibrate.py first.")
            continue

        temp = cv2.imread(str(t_path))
        if temp is None: continue

        # --- KEY FIX: NO OVERSCAN ---
        # We use the exact corners from the layout so the image isn't "moved up"
        target_corners = corners

        # 2. Prepare Screenshot
        h_shot, w_shot = shot.shape[:2]
        src_corners = np.float32([[0, 0], [w_shot, 0], [w_shot, h_shot], [0, h_shot]])
        
        # 3. Warp with Edge Extension
        matrix = cv2.getPerspectiveTransform(src_corners, target_corners)
        
        # BORDER_REPLICATE fills the tiny gap created by dilation with the edge colors
        # instead of zooming the image.
        warped = cv2.warpPerspective(
            shot, 
            matrix, 
            (temp.shape[1], temp.shape[0]), 
            flags=cv2.INTER_LINEAR,
            borderMode=cv2.BORDER_REPLICATE 
        )
        
        # 4. Generate High-Quality Mask
        mask = get_refined_mask(temp)
        
        # 5. Compositing
        alpha = mask.astype(float) / 255.0
        alpha = np.clip(alpha, 0, 1) # Ensure bounds
        
        alpha = np.dstack((alpha, alpha, alpha))
        
        final = (temp * (1.0 - alpha) + warped * alpha).astype(np.uint8)

        out_path = output_dir / f"final_{t_name}.png"
        cv2.imwrite(str(out_path), final)
        print(f"✅ Saved {out_path}")

if __name__ == "__main__":
    main()