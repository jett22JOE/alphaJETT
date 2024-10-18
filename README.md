# Gaze Tracking Virtual Keyboard

This project consists of a React frontend and a FastAPI backend for a gaze tracking virtual keyboard.

## Frontend Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

## Backend Setup

The backend requires Python 3.7+ and the following packages:

- fastapi
- uvicorn
- tensorflow
- numpy
- python-multipart
- pydantic

To set up the backend (on a system with Python and pip):

1. Install the required packages:
   ```
   pip install fastapi uvicorn tensorflow numpy python-multipart pydantic
   ```

2. Start the FastAPI server:
   ```
   uvicorn api.main:app --reload
   ```

Note: Ensure you have the necessary Python environment and packages installed on your deployment server.

## Development

Run the frontend and backend servers simultaneously. The React app will be available at `http://localhost:5173` (or similar), and the API will be accessible at `http://localhost:8000`.