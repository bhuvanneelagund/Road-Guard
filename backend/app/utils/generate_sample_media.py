import cv2
import numpy as np
import os
import csv
import datetime

UPLOADS_DIR = "backend/uploads"
IMAGES_DIR = os.path.join(UPLOADS_DIR, "images")
VERIF_DIR = os.path.join(UPLOADS_DIR, "verification")
WATER_DIR = os.path.join(UPLOADS_DIR, "waterlogging")
VIDEOS_DIR = os.path.join(UPLOADS_DIR, "videos")

os.makedirs(IMAGES_DIR, exist_ok=True)
os.makedirs(VERIF_DIR, exist_ok=True)
os.makedirs(WATER_DIR, exist_ok=True)
os.makedirs(VIDEOS_DIR, exist_ok=True)

def create_asphalt_texture(w=640, h=480, base_color=(55, 58, 62)):
    # Base asphalt gray
    img = np.full((h, w, 3), base_color, dtype=np.uint8)
    # Add grain / aggregate noise
    noise = np.random.normal(0, 15, (h, w, 3)).astype(np.int16)
    noisy_img = np.clip(img.astype(np.int16) + noise, 0, 255).astype(np.uint8)
    
    # Add perspective road lane markings
    lane_color = (190, 195, 200)
    cv2.line(noisy_img, (w // 2, int(h * 0.3)), (w // 2, h), (180, 160, 40), 4) # yellow centerline
    return noisy_img

# 1. Sample Pothole PB Road
img1 = create_asphalt_texture()
# Draw deep pothole depression
cv2.ellipse(img1, (280, 310), (75, 45), -15, 0, 360, (20, 22, 25), -1) # dark hole
cv2.ellipse(img1, (285, 315), (65, 35), -15, 0, 360, (10, 12, 14), -1) # deeper core
cv2.ellipse(img1, (280, 310), (80, 50), -15, 0, 360, (90, 95, 100), 2) # jagged rim
# Second smaller pothole
cv2.ellipse(img1, (430, 330), (40, 25), 10, 0, 360, (18, 20, 22), -1)
# Bounding box annotations (glowing red and cyan)
cv2.rectangle(img1, (185, 250), (375, 375), (0, 0, 255), 2)
cv2.putText(img1, "Pothole (D40) 91%", (185, 242), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 0, 255), 2)
cv2.rectangle(img1, (380, 295), (480, 365), (0, 0, 255), 2)
cv2.putText(img1, "Pothole (D40) 86%", (380, 287), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 0, 255), 2)
# Banner
cv2.rectangle(img1, (0, 0), (640, 30), (10, 18, 38), -1)
cv2.putText(img1, "ROADGUARD AI - PB Road Davanagere | Telemetry Tagged", (15, 20), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 212, 255), 1)
cv2.imwrite(os.path.join(IMAGES_DIR, "sample_pothole_pb_road.jpg"), img1)

# 2. Sample Cracks Hadadi Road
img2 = create_asphalt_texture()
# Draw alligator cracking network
pts_list = [
    [(180, 200), (220, 240), (250, 210), (290, 250), (320, 220)],
    [(220, 240), (260, 280), (310, 260), (340, 310)],
    [(190, 270), (230, 290), (260, 340), (300, 360)],
    [(250, 210), (300, 190), (350, 230), (380, 210)]
]
for pts in pts_list:
    for i in range(len(pts) - 1):
        cv2.line(img2, pts[i], pts[i+1], (20, 20, 20), 2)
        cv2.line(img2, pts[i], pts[i+1], (90, 90, 90), 1)

cv2.rectangle(img2, (150, 170), (410, 380), (0, 215, 255), 2)
cv2.putText(img2, "Alligator Crack (D20) 88%", (150, 162), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 215, 255), 2)
cv2.rectangle(img2, (0, 0), (640, 30), (10, 18, 38), -1)
cv2.putText(img2, "ROADGUARD AI - Hadadi Road Commercial Corridor", (15, 20), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 212, 255), 1)
cv2.imwrite(os.path.join(IMAGES_DIR, "sample_crack_hadadi.jpg"), img2)

# 3. Sample Harihar Bypass
img3 = create_asphalt_texture()
cv2.ellipse(img3, (240, 380), (110, 60), -10, 0, 360, (12, 14, 16), -1)
cv2.ellipse(img3, (470, 330), (60, 35), 15, 0, 360, (15, 18, 20), -1)
cv2.rectangle(img3, (120, 310), (360, 450), (0, 0, 255), 2)
cv2.putText(img3, "Pothole (D40) 94%", (120, 302), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 0, 255), 2)
cv2.rectangle(img3, (400, 285), (540, 375), (0, 0, 255), 2)
cv2.putText(img3, "Pothole (D40) 89%", (400, 277), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 0, 255), 2)
cv2.rectangle(img3, (0, 0), (640, 30), (10, 18, 38), -1)
cv2.putText(img3, "ROADGUARD AI - Harihar Bypass Link Highway", (15, 20), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 212, 255), 1)
cv2.imwrite(os.path.join(IMAGES_DIR, "sample_harihar_bypass.jpg"), img3)

# 4. Verification Sample After Image (Repaired smooth asphalt patch)
img4 = create_asphalt_texture()
# Fresh black bituminous overlay patch
cv2.ellipse(img4, (280, 310), (100, 65), -15, 0, 360, (30, 32, 35), -1)
cv2.ellipse(img4, (280, 310), (98, 63), -15, 0, 360, (25, 27, 30), -1)
cv2.rectangle(img4, (0, 0), (640, 30), (10, 18, 38), -1)
cv2.putText(img4, "ROADGUARD AI - Completed Cold Patch Repair (Verified)", (15, 20), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (16, 185, 129), 1)
cv2.imwrite(os.path.join(VERIF_DIR, "sample_verified_after.jpg"), img4)

# 5. Sample GPS Track CSV (PB Road Davanagere)
gps_csv_path = os.path.join(UPLOADS_DIR, "sample_gps_track.csv")
with open(gps_csv_path, "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["time", "latitude", "longitude", "speed_kmh", "altitude_m"])
    base_lat, base_lng = 14.4644, 75.9218
    for sec in range(60):
        t_str = f"2026-11-25T10:30:{sec:02d}Z"
        lat = base_lat + (sec * 0.00012)
        lng = base_lng + (sec * 0.00010)
        writer.writerow([t_str, f"{lat:.6f}", f"{lng:.6f}", "32.4", "602.5"])

# 6. Sample 5-second MP4 Video for video survey test
video_mp4_path = os.path.join(VIDEOS_DIR, "sample_survey_video.mp4")
fourcc = cv2.VideoWriter_fourcc(*'mp4v')
out_vid = cv2.VideoWriter(video_mp4_path, fourcc, 10.0, (640, 480))
for frame_num in range(50):
    frame = create_asphalt_texture()
    # Move pothole down over time to simulate driving forward
    p_y = 150 + (frame_num * 6)
    if p_y < 460:
        cv2.ellipse(frame, (320, p_y), (60, 30), 0, 0, 360, (15, 18, 20), -1)
        cv2.ellipse(frame, (320, p_y), (65, 34), 0, 0, 360, (80, 85, 90), 2)
    cv2.putText(frame, f"SURVEY TELEMETRY FRAME: {frame_num:03d} | SPEED: 32 km/h", (15, 460), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 212, 255), 1)
    out_vid.write(frame)
out_vid.release()

print("Visual sample artifacts successfully generated in backend/uploads.")
