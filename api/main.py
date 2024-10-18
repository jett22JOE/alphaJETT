from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import tensorflow as tf
from typing import List
import uvicorn
import logging
import cv2

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the pre-existing eye-tracking model
try:
    model = tf.keras.models.load_model("eye_tracking_model.h5")
    logger.info("Eye-tracking model loaded successfully")
except Exception as e:
    logger.error(f"Failed to load eye-tracking model: {str(e)}")
    model = None

class GazeData(BaseModel):
    x: float
    y: float

class CalibrationData(BaseModel):
    gaze_data: List[GazeData]
    screen_points: List[GazeData]

@app.post("/initialize")
async def initialize_tracker():
    logger.info("Initializing tracker")
    # Initialize the tracker (placeholder)
    return {"message": "Tracker initialized successfully"}

@app.post("/capture-gaze")
async def capture_gaze(image: UploadFile = File(...)):
    try:
        logger.info("Capturing gaze")
        contents = await image.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        processed_img = preprocess_image(img)
        
        if model is None:
            raise HTTPException(status_code=500, detail="Eye-tracking model not loaded")
        
        gaze_vector = model.predict(np.expand_dims(processed_img, axis=0))[0]
        
        # Normalize gaze vector to screen coordinates (0-1 range)
        x = (gaze_vector[0] + 1) / 2
        y = (gaze_vector[1] + 1) / 2
        
        return {"x": float(x), "y": float(y)}
    except Exception as e:
        logger.error(f"Error capturing gaze: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/translate-gaze")
async def translate_gaze(gaze_data: GazeData):
    logger.info(f"Translating gaze: {gaze_data}")
    # Simple keyboard layout
    keyboard = [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
    ]
    
    # Map gaze coordinates to keyboard
    row = int(gaze_data.y * len(keyboard))
    col = int(gaze_data.x * len(keyboard[row]))
    
    return {"key": keyboard[row][col]}

@app.post("/calibrate")
async def calibrate_model(calibration_data: CalibrationData):
    logger.info("Calibrating model")
    # Perform model calibration (placeholder)
    # In a real implementation, you'd use the calibration data to fine-tune the model
    return {"message": "Calibration completed successfully"}

@app.post("/update-model")
async def update_model(training_data: List[GazeData]):
    logger.info("Updating model")
    # Update the model with new training data (placeholder)
    # In a real implementation, you'd retrain or fine-tune the model with new data
    return {"message": "Model updated successfully"}

def preprocess_image(img):
    # Implement more sophisticated image preprocessing here
    img_gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    img_resized = cv2.resize(img_gray, (64, 64))
    img_normalized = img_resized / 255.0
    return img_normalized

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)