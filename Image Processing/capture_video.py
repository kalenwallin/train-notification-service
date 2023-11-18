import cv2
import numpy as np
import tensorflow as tf

#uses the EfficientDet model from the TF2 Model Zoo to detect objects in the webcam feed

# Load the pre-trained EfficientDet model
model = tf.saved_model.load("efficientdet_d0_coco/saved_model")

def detect_objects(image):
    # Convert the image to a NumPy array
    image_np = np.array(image)

    # Convert the NumPy array to a tensor
    input_tensor = tf.convert_to_tensor([image_np])

    # Perform inference
    detections = model(input_tensor)

    return detections


# Create a VideoCapture object
cap = cv2.VideoCapture(0)  # 0 represents the default camera (change if using an external webcam)

while True:
    # Capture frame-by-frame
    ret, frame = cap.read()

    # Detect objects in the frame
    detections = detect_objects(frame)

    # Display the resulting frame with bounding boxes
    for detection in detections['detection_boxes']:
        ymin, xmin, ymax, xmax = detection.numpy()[0]
        xmin = int(xmin * frame.shape[1])
        xmax = int(xmax * frame.shape[1])
        ymin = int(ymin * frame.shape[0])
        ymax = int(ymax * frame.shape[0])

        # Draw a bounding box around the detected object
        cv2.rectangle(frame, (xmin, ymin), (xmax, ymax), (0, 255, 0), 2)


    # Display the resulting frame
    cv2.imshow('Webcam', frame)

    # Break the loop if 'q' is pressed
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Release the camera and close all OpenCV windows
cap.release()
cv2.destroyAllWindows()
