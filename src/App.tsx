import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Frown, Smile, HelpCircle, Pause, Play, Send } from 'lucide-react';
import Webcam from 'react-webcam';
import axios from 'axios';

const App: React.FC = () => {
  const [isPaused, setIsPaused] = useState(false);
  const [pausedImage, setPausedImage] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [capturedVector, setCapturedVector] = useState<{ x: number; y: number } | null>(null);
  const [chatLog, setChatLog] = useState<{ type: 'user' | 'system', message: string }[]>([]);

  const webcamRef = useRef<Webcam>(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    setPausedImage(imageSrc || null);
  }, [webcamRef]);

  const togglePause = () => {
    setIsPaused((prev) => !prev);
    if (!isPaused) {
      capture();
    } else {
      setPausedImage(null);
      setSelectedOption('');
      setCapturedVector(null);
    }
  };

  const addMessage = (type: 'user' | 'system', message: string) => {
    setChatLog((prev) => [...prev, { type, message }]);
  };

  const categorizeInput = (category: 'sad' | 'happy' | 'question') => {
    addMessage('user', `Input categorized as: ${category}`);
  };

  const sendPausedImage = async () => {
    if (pausedImage && selectedOption) {
      try {
        addMessage('user', 'Sending paused image for categorization...');
        const formData = new FormData();
        const response = await fetch(pausedImage);
        const blob = await response.blob();
        formData.append('image', blob, 'paused_frame.jpg');
        
        const result = await axios.post('http://localhost:8000/categorize-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        console.log('Image categorization:', result.data);
        addMessage('system', `Image categorized as: ${result.data.category}`);
        categorizeInput(selectedOption as 'sad' | 'happy' | 'question');

        if (window.parent && window.parent !== window) {
          const messageData = {
            type: 'vector_captured',
            vector: capturedVector ? {
              x: capturedVector.x,
              y: capturedVector.y
            } : null,
            category: selectedOption
          };
          window.parent.postMessage(JSON.parse(JSON.stringify(messageData)), '*');
        }
      } catch (error) {
        console.error('Failed to categorize image:', error);
        addMessage('system', 'Failed to categorize image.');
      } finally {
        setIsPaused(false);
        setPausedImage(null);
        setSelectedOption('');
        setCapturedVector(null);
      }
    }
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        togglePause();
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [isPaused]);

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 relative">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          className="w-full h-full object-cover"
        />
        {isPaused && pausedImage && (
          <div className="absolute inset-0">
            <img src={pausedImage} alt="Paused frame" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-64 h-64 border-4 border-white rounded-full flex items-center justify-center">
            <div className="w-48 h-48 border-2 border-white rounded-full flex items-center justify-center">
              <div className="w-32 h-32 border border-white rounded-full"></div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
          <button
            onClick={() => setSelectedOption('sad')}
            className={`p-2 rounded-full ${selectedOption === 'sad' ? 'bg-blue-500' : 'bg-gray-200'}`}
          >
            <Frown size={24} />
          </button>
          <button
            onClick={() => setSelectedOption('happy')}
            className={`p-2 rounded-full ${selectedOption === 'happy' ? 'bg-blue-500' : 'bg-gray-200'}`}
          >
            <Smile size={24} />
          </button>
          <button
            onClick={() => setSelectedOption('question')}
            className={`p-2 rounded-full ${selectedOption === 'question' ? 'bg-blue-500' : 'bg-gray-200'}`}
          >
            <HelpCircle size={24} />
          </button>
        </div>
      </div>
      <div className="bg-gray-100 p-4">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={togglePause}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            {isPaused ? <Play size={24} /> : <Pause size={24} />}
          </button>
          <button
            onClick={sendPausedImage}
            disabled={!isPaused || !selectedOption}
            className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            <Send size={24} />
          </button>
        </div>
        <div className="h-40 overflow-y-auto bg-white p-2 rounded">
          {chatLog.map((entry, index) => (
            <div key={index} className={`mb-2 ${entry.type === 'user' ? 'text-blue-600' : 'text-green-600'}`}>
              {entry.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;