# ROADGUARD AI - Hardware Integration & Prototype Guide

## 1. Prototype Overview (₹5,000 Budget Target)

To make RoadGuard AI immediately viable for municipal inspection teams in Tier-2 and Tier-3 Indian cities, our physical telemetry capture prototype was intentionally engineered within an approximate budget of **₹5,000 INR**.

Rather than relying on expensive industrial LiDAR or dedicated RTK GPS units costing lakhs of rupees, RoadGuard AI utilizes:
1. An **Android smartphone** for cellular internet hotspot and precision satellite GPS logging.
2. A **1080p USB webcam** mounted to the vehicle hood/dashboard for high-resolution road pavement optical capture.
3. A **laptop or portable edge processor** running our OpenCV + YOLO pipeline.

---

## 2. Hardware Bill of Materials (BoM)

| Item | Specification | Approximate Cost (INR) | Primary Purpose |
|---|---|---|---|
| **USB Webcam** | 1080p FHD, 30 FPS, Wide-Angle (e.g. Logitech C270 / Quantum QHM495LM) | ₹1,200 - ₹1,800 | Continuous pavement optical video capture |
| **Android Smartphone** | Any standard Android phone with GNSS/GPS & 4G/5G | (Existing user device) | Supplies GPS stream and 4G/5G field connectivity |
| **Vehicle Camera Mount** | Heavy-duty suction cup windshield or hood mount | ₹450 - ₹700 | Vibration-damped vehicle camera positioning |
| **Car USB 12V Charger** | Dual-port QC 3.0 / 30W adapter | ₹400 - ₹600 | Continuous power from vehicle 12V auxiliary socket |
| **Powered OTG Hub** | USB-C / Micro-USB to multi-USB adapter with PD power pass-through | ₹600 - ₹900 | Connects peripherals without draining phone battery |
| **USB Extension Cable** | 2m - 3m shielded USB 2.0/3.0 cable | ₹200 - ₹350 | Cable routing from hood mount to car cabin |
| **Total Approximate Cost** | | **~₹3,500 - ₹4,800 INR** | Complete field vehicle capture rig |

---

## 3. Telemetry Synchronization: How to Record GPS on Android while Capturing Video

### Important Engineering Realization:
*Standard USB webcams do not possess onboard GPS antennas.* 
To attach coordinates to road damage detections, we synchronize the video frame timestamps with an Android GPS log stream.

### Step-by-Step Recording Procedure:

#### Phase 1: Set Up Android GPS Logging
1. Download a free, open-source GNSS logger on the Android phone:
   * Recommended: **OpenTracks** (from F-Droid / Google Play) or **GPS Logger for Android**.
2. Mount the Android smartphone on the vehicle dashboard where it has a clear line of sight to the sky.
3. In the GPS Logger settings:
   * Logging interval: **1 second** (1 Hz).
   * Format: **CSV** or **GPX**.
   * Elevation: Included.
4. Tap **Start Recording** right before beginning the road inspection survey. Note the phone clock time (e.g. `10:30:00 AM`).

#### Phase 2: Start Video Capture on the USB Camera
1. Mount the USB webcam on the center of the vehicle hood or behind the windshield facing down at a ~45-degree angle toward the asphalt surface.
2. Connect the camera to your laptop or capture device.
3. Start video recording using any standard capture software or RoadGuard's Live Camera tool:
   * Resolution: `1920x1080` or `1280x720`.
   * Frame rate: `30 FPS`.
4. Note the video start time.

#### Phase 3: Video Survey & Ingestion
1. Drive the inspection vehicle along the designated road corridor at a steady municipal speed (**20 - 40 km/h**).
2. When the inspection run is completed:
   * Stop video recording (saves as `.mp4`).
   * Stop GPS Logger on Android and export the recorded file as `.csv`.
3. Open RoadGuard AI:
   * Go to **AI Road Damage Detection** -> **Video Survey**.
   * Upload the recorded video `.mp4`.
   * Upload the exported Android `.csv` track log.
   * Click **Execute Detection**.

#### Automated Processing Workflow:
1. OpenCV opens the video and extracts frames every 1.0 second.
2. For each keyframe, the video processor records `elapsed_seconds` and calculates `frame_timestamp = start_time + elapsed_seconds`.
3. The **GPS Matcher Service** (`backend/app/services/gps_matcher.py`) finds the nearest GPS record in the CSV with the closest timestamp.
4. YOLO runs object detection on the frame.
5. If defects are found, the detection is saved in the database with the exact matched latitude and longitude coordinates.

---

## 4. Testing Android Device USB Camera (UVC) Compatibility

Not every Android device supports USB Video Class (UVC) camera input directly over OTG due to kernel driver limitations.

### How to Test Camera Compatibility:
1. Connect the USB webcam to your Android phone via a USB-OTG adapter.
2. Install **USB Camera - Connect EasyCap or USB WebCam** (by ShenYao China) from the Google Play Store.
3. Open the app and grant USB permissions when prompted.
4. **Compatibility Checks**:
   * If the camera feed appears immediately, your phone kernel supports UVC OTG streaming natively.
   * If the app shows a black screen or "Device not supported", the device lacks UVC drivers in its vendor Android kernel. In this scenario, use the laptop-in-cabin method described above, which works with 100% of USB webcams.

---

## 5. Mounting & Camera Calibration Best Practices
* **Lens Angle**: Angle the camera downwards so the horizon occupies only the top 20% of the frame, ensuring 80% of the frame is focused on the road surface.
* **Sun Glare Mitigation**: In bright Indian afternoon sunlight, attach an inexpensive circular polarizing filter (CPL) over the webcam lens to cut asphalt specular reflections.
* **Vibration Dampening**: Use rubber gasket washers between the suction mount and camera arm to prevent high-frequency engine vibration blur.
