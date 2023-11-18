import cv2
import numpy as np
import tensorflow as tf

# Load the pre-trained Faster R-CNN model
model_path = 'faster_rcnn_inception_resnet_v2_coco/saved_model'
detect_fn = tf.saved_model.load(model_path)

# Create a VideoCapture object
cap = cv2.VideoCapture(0)  # Use 0 for default camera, change if using an external webcam

# Create a background subtractor
fgbg = cv2.createBackgroundSubtractorMOG2()

while True:
    # Capture frame-by-frame
    ret, frame = cap.read()

    # Apply background subtraction
    fgmask = fgbg.apply(frame)

    # Threshold the foreground mask to get binary image
    _, thresh = cv2.threshold(fgmask, 25, 255, cv2.THRESH_BINARY)

    # Find contours in the binary image
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    # Draw bounding boxes around moving objects
    for contour in contours:
        x, y, w, h = cv2.boundingRect(contour)
        cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)

        # Crop the region of interest (ROI) around the detected object
        roi = frame[y:y + h, x:x + w]

        # Detect if a train is present in the ROI
        detections = detect_fn(tf.convert_to_tensor([roi]))
        for detection in detections['detection_classes']:
            if detection == 44:  # 44 corresponds to the class label for 'train' in COCO dataset
                # Save the image with a train to a new file
                cv2.imwrite('train_detected_image.jpg', frame)
                print('Train detected! Image saved.')
                break

    # Display the resulting frame
    cv2.imshow('Object Motion Detection', frame)

    # Break the loop if 'q' is pressed
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Release the camera and close all OpenCV windows
cap.release()
cv2.destroyAllWindows()
