import cv2
import numpy as np
import json
from pathlib import Path
import argparse

# ==========================================
# 1. GEOMETRY ENGINE
# ==========================================

def get_virtual_corners(mask, debug_img=None):
    # 1. Clean mask to remove fuzzy edges
    kernel = np.ones((3,3), np.uint8)
    clean_mask = cv2.erode(mask, kernel, iterations=2)
    
    contours, _ = cv2.findContours(clean_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours: return None
    
    cnt = max(contours, key=cv2.contourArea)
    
    # Calculate True Center of the green hole
    M = cv2.moments(cnt)
    if M['m00'] == 0: return None
    cx_true, cy_true = int(M['m10'] / M['m00']), int(M['m01'] / M['m00'])
    
    # 2. Bucket points
    buckets = {'top': [], 'bot': [], 'left': [], 'right': []}
    for pt in cnt.reshape(-1, 2):
        px, py = pt
        dx, dy = px - cx_true, py - cy_true
        if abs(dx) > abs(dy): # Horizontal
            buckets['left' if dx < 0 else 'right'].append(pt)
        else: # Vertical
            buckets['top' if dy < 0 else 'bot'].append(pt)

    # 3. Fit Lines (Middle 50% Rule)
    lines = {}
    for side, pts in buckets.items():
        if len(pts) < 10: return get_safe_box(mask)
        
        pts_array = np.array(pts)
        if side in ['top', 'bot']:
            pts_array = pts_array[pts_array[:, 0].argsort()]
        else:
            pts_array = pts_array[pts_array[:, 1].argsort()]
            
        n = len(pts_array)
        pts_array = pts_array[int(n*0.25):int(n*0.75)]
        
        if len(pts_array) < 5: pts_array = np.array(buckets[side])
        lines[side] = cv2.fitLine(pts_array, cv2.DIST_L2, 0, 0.01, 0.01).flatten()

    # 4. Intersect
    def intersect(l1, l2):
        vx1, vy1, x1, y1 = l1
        vx2, vy2, x2, y2 = l2
        denom = vx1*vy2 - vy1*vx2
        if abs(denom) < 1e-5: return None
        t = ((x2-x1)*vy2 - (y2-y1)*vx2) / denom
        return [float(x1+t*vx1), float(y1+t*vy1)]

    tl = intersect(lines['left'], lines['top'])
    tr = intersect(lines['right'], lines['top'])
    br = intersect(lines['right'], lines['bot'])
    bl = intersect(lines['left'], lines['bot'])

    if any(p is None for p in [tl, tr, br, bl]): 
        return get_safe_box(mask)
    
    corners = np.array([tl, tr, br, bl], dtype=np.float32)
    
    # 5. HORIZONTAL SNAP (The Compromise)
    # We calculate where our virtual box is
    virtual_center = np.mean(corners, axis=0)
    
    # We measure the gap
    diff_x = cx_true - virtual_center[0]
    diff_y = cy_true - virtual_center[1]
    
    # We apply FULL correction to X (to center it), 
    # but ZERO correction to Y (to keep 3D tilt).
    shift = np.array([diff_x, 0]) 
    
    corners += shift
    
    # 6. Apply tiny overscan (1%) just to be safe
    center = np.mean(corners, axis=0)
    corners = center + (corners - center) * 1.01
    
    return sort_corners(corners)

def get_safe_box(mask):
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours: return None
    cnt = max(contours, key=cv2.contourArea)
    rect = cv2.minAreaRect(cnt)
    box = cv2.boxPoints(rect)
    
    # 1% Overscan for flat box
    center = np.mean(box, axis=0)
    expanded = center + (box - center) * 1.01
    return sort_corners(expanded.astype(np.float32))

def sort_corners(pts):
    pts = pts[np.argsort(pts[:, 1]), :]
    top = pts[:2]
    bot = pts[2:]
    tl, tr = top[np.argsort(top[:, 0]), :]
    bl, br = bot[np.argsort(bot[:, 0]), :]
    return np.float32([tl, tr, br, bl])

# ==========================================
# 2. MAIN PROCESSING
# ==========================================

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--screenshot', type=str, required=True, help="Path to user screenshot")
    parser.add_argument('--template', type=str, required=True, help="Path to template image")
    parser.add_argument('--layout', type=str, required=True, help="Path to layout.json")
    parser.add_argument('--output', type=str, required=True, help="Path to output file")
    args = parser.parse_args()

    # 1. Load Screenshot
    shot = cv2.imread(args.screenshot)
    if shot is None:
        print(f"Error: Could not read screenshot at {args.screenshot}")
        exit(1)

    # 2. Load Template
    template_path = Path(args.template)
    temp = cv2.imread(str(template_path))
    if temp is None:
        print(f"Error: Could not read template at {args.template}")
        exit(1)

    t_name = template_path.stem

    # 3. Load Layout / Coordinates
    layout_file = Path(args.layout)
    corners = None
    
    if layout_file.exists():
        try:
            with open(layout_file, 'r') as f: 
                layout = json.load(f)
                if t_name in layout:
                    corners = np.array(layout[t_name], dtype=np.float32)
        except Exception as e:
            print(f"Warning: Failed to load layout.json: {e}")

    # Fallback: Calculate if missing
    if corners is None:
        print(f"Calculating corners for {t_name}...")
        hsv = cv2.cvtColor(temp, cv2.COLOR_BGR2HSV)
        mask = cv2.inRange(hsv, np.array([30, 40, 40]), np.array([90, 255, 255]))
        corners = get_virtual_corners(mask)
        
        if corners is None:
            print(f"Error: Could not detect green screen in {t_name}")
            exit(1)

    # 4. Perspective Warp
    h, w = shot.shape[:2]
    src_corners = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
    
    matrix = cv2.getPerspectiveTransform(src_corners, corners)
    
    # WARP SCREENSHOT (High Quality)
    # Using INTER_CUBIC as requested for better quality
    warped = cv2.warpPerspective(shot, matrix, (temp.shape[1], temp.shape[0]), 
                                 flags=cv2.INTER_CUBIC)
    
    # 5. Composite (Soft Edge Blending)
    
    # Generate Alpha Mask from Geometry
    # Create a white rectangle matching the source screenshot size
    mask_src = np.full((h, w), 255, dtype=np.uint8)
    
    # Warp the mask using the same matrix to match the screenshot's position
    warped_mask = cv2.warpPerspective(mask_src, matrix, (temp.shape[1], temp.shape[0]), 
                                      flags=cv2.INTER_CUBIC)
    
    # Soften the edges to remove jaggies (Anti-aliasing simulation)
    # Kernel size (5,5) creates a soft transition
    warped_mask = cv2.GaussianBlur(warped_mask, (5, 5), 0)
    
    # Normalize Alpha to 0.0 - 1.0 range
    alpha = warped_mask.astype(float) / 255.0
    
    # Expand Alpha to 3 channels (H, W, 1) -> (H, W, 3) for vectorized multiplication
    alpha_3c = np.expand_dims(alpha, axis=2)
    
    # Alpha Blending Formula: Final = Src * Alpha + Dst * (1 - Alpha)
    # 'warped' is the source (Screenshot)
    # 'temp' is the destination (Phone Background)
    final_float = (warped.astype(float) * alpha_3c) + (temp.astype(float) * (1.0 - alpha_3c))
    
    # Clip and cast back to uint8
    final = np.clip(final_float, 0, 255).astype(np.uint8)

    # 6. Save
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(output_path), final)
    print(f"Saved {output_path}")

if __name__ == "__main__":
    main()