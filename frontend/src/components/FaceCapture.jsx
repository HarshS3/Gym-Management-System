import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import { config } from '../config/config';

// Debug logging
const logApiRequest = (url, method = 'GET') => {
  console.log('Face API Request:', {
    url,
    method,
    environment: process.env.NODE_ENV,
    baseUrl: config.faceApiUrl
  });
};

const videoConstraints = {
  width: 480,
  height: 360,
  facingMode: 'user',
};

/**
 * Simple webcam component that returns a base64 screenshot
 * when the user clicks "Capture Face" button.
 *
 * @param {Function} onCapture - callback(imageSrc: string)
 */
const FaceCapture = ({ onCapture, capturing = false }) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  // Load face-api models once
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = 'https://justadummy.com/models'; // auto CDN fallback provided by face-api.js
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights');
        setModelsLoaded(true);
      } catch (err) {
        console.error('Failed to load face-api models', err);
      }
    };
    loadModels();
  }, []);

  // Detect faces and draw boxes
  useEffect(() => {
    let animationId;
    const detect = async () => {
      if (
        modelsLoaded &&
        webcamRef.current &&
        webcamRef.current.video.readyState === 4
      ) {
        const video = webcamRef.current.video;
        const detections = await faceapi.detectAllFaces(
          video,
          new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.5 })
        );
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.lineWidth = 3;
          ctx.strokeStyle = '#22c55e'; // green-500
          detections.forEach((det) => {
            const { x, y, width, height } = det.box;
            ctx.strokeRect(x, y, width, height);
          });
        }
      }
      animationId = requestAnimationFrame(detect);
    };
    detect();
    return () => cancelAnimationFrame(animationId);
  }, [modelsLoaded]);

  const capture = () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (typeof onCapture === 'function') onCapture(imageSrc);
  };

  return (
    <div className="relative">
      {/* Overlay when loading models or capturing */}
      {( !modelsLoaded || capturing ) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20 rounded-lg">
          {(!modelsLoaded) ? (
            <span className="text-white text-sm">Loading face detector...</span>
          ) : (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
              <span className="text-white text-xs mt-2">Processing...</span>
            </div>
          )}
        </div>
      )}
      <Webcam
        audio={false}
        height={360}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width={480}
        videoConstraints={videoConstraints}
        className="rounded-lg border border-yellow-500/40"
      />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 rounded-lg"
      />
      <div className="flex justify-center mt-4">
        <button
          onClick={capture}
          disabled={capturing || !modelsLoaded}
          className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 rounded-lg text-white font-semibold shadow"
        >
          {capturing ? 'Capturing...' : 'Capture Face'}
        </button>
      </div>
    </div>
  );
};

export default FaceCapture; 