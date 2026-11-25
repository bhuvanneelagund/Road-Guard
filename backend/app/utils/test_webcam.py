"""
ROADGUARD AI - Hardware Diagnosis Utility
Tests connected USB webcams and verifies OpenCV video capture capabilities.
"""
import cv2

def scan_cameras(max_devices: int = 5):
    print("==================================================")
    print("ROADGUARD AI - USB Camera Hardware Scanner")
    print("==================================================")
    available_cameras = []

    for idx in range(max_devices):
        cap = cv2.VideoCapture(idx, cv2.CAP_DSHOW if cv2.os.name == 'nt' else cv2.CAP_ANY)
        if cap.isOpened():
            ret, frame = cap.read()
            if ret:
                w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
                h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
                fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
                print(f"[FOUND] Camera Index {idx}: Active ({w}x{h} @ {fps:.1f} FPS)")
                available_cameras.append({"index": idx, "width": w, "height": h, "fps": fps})
            cap.release()

    if not available_cameras:
        print("[NOTICE] No physical USB cameras detected. RoadGuard AI can operate via recorded video files or browser camera stream.")
    else:
        print(f"\nTotal active cameras found: {len(available_cameras)}")
        print("To stream from Camera 0 in RoadGuard AI, use the Live Camera capture tab in the web dashboard.")

    return available_cameras

if __name__ == "__main__":
    scan_cameras()
