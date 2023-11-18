import json

import cv2
import numpy as np
import requests

# Load YOLO
net = cv2.dnn.readNet("yolov3.weights", "yolov3.cfg")

# Check if the network is loaded successfully
if net.empty():
    print("Error: Unable to load the YOLO model.")
    exit()

# Get layer names
layer_names = net.getLayerNames()

# Get output layers
try:
    output_layers = [layer_names[i - 1] for i in net.getUnconnectedOutLayers()]
except IndexError as e:
    print(f"Error: {e}. Please check the YOLO model structure.")
    exit()

# Load the COCO class labels
with open("coco.names", "r") as f:
    classes = [line.strip() for line in f.readlines()]

# Create a VideoCapture object
cap = cv2.VideoCapture(0)  # Use 0 for default camera, change if using an external webcam

# Counter for naming the saved images
screenshot_counter = 1

while True:
    # Capture frame-by-frame
    ret, frame = cap.read()
    if not ret:
        break

    # Convert frame to blob
    blob = cv2.dnn.blobFromImage(frame, 0.00392, (416, 416), (0, 0, 0), True, crop=False)
    net.setInput(blob)
    outs = net.forward(output_layers)

    train_found = False

    # Process detections
    for out in outs:
        for detection in out:
            scores = detection[5:]
            class_id = np.argmax(scores)
            confidence = scores[class_id]
            if confidence > 0.5 and classes[class_id] == "train":
                # Object detected
                center_x = int(detection[0] * frame.shape[1])
                center_y = int(detection[1] * frame.shape[0])
                w = int(detection[2] * frame.shape[1])
                h = int(detection[3] * frame.shape[0])

                # Rectangle coordinates
                x = int(center_x - w / 2)
                y = int(center_y - h / 2)

                cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)

                # Save the image when a train is detected
                screenshot_name = f'screenshot_train_{screenshot_counter}.jpg'
                cv2.imwrite(screenshot_name, frame)
                print(f'Train detected! Image saved as {screenshot_name}')
                screenshot_counter += 1
                train_found = True
                break
        if(train_found):
            response = requests.post(r"http://localhost:8081/api/ingest/1", headers={'Content-Type': 'application/json', 'Authorization': ''})
            print(response.text)
            break

    if(train_found):
        
        break

    # Display the frame
    cv2.imshow('Object Detection with YOLO', frame)

    # Break the loop if 'q' is pressed
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Release the camera and close all OpenCV windows
cap.release()
cv2.destroyAllWindows()
