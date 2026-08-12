import { useState, useRef, useEffect } from 'react';
import { Upload, Copy, Download, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import Navbar from './components/Navbar';
import History from './components/History';
import Features from './components/Features';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import About from './components/About';
import { ModelService } from './services/modelService';
import { useHistory } from './hooks/useHistory';
import { validateImageFile } from './utils/fileValidation';

interface OCRResult {
  text: string;
  confidence: number;
  source: 'tesseract' | 'tf' | 'combined';
}

function MainContent() {
  const [image, setImage] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [editableText, setEditableText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [modelStatus, setModelStatus] = useState<string>('Initializing models...');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { history, addEntry, removeEntry, clearHistory } = useHistory();
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;

    const initializeModels = async () => {
      try {
        const modelService = ModelService.getInstance();
        await modelService.ready;
        if (!cancelled) {
          setModelStatus(
            modelService.isEnhanced()
              ? 'Models initialized successfully (custom model active)'
              : 'Models initialized successfully'
          );
        }
      } catch (error) {
        console.error('Model initialization error:', error);
        if (!cancelled) {
          setModelStatus('Error initializing models. Some features may be limited.');
        }
      }
    };

    initializeModels();

    return () => {
      cancelled = true;
    };
  }, []);

  const loadAndProcessFile = (file: File) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setUploadError(validation.error ?? 'This file cannot be processed.');
      return;
    }
    setUploadError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      processImage(file);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      loadAndProcessFile(file);
    }
  };

  const handleReselect = () => {
    setImage(null);
    setOcrResult(null);
    setEditableText('');
    setProcessingStatus('');
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processImage = async (imageFile: File) => {
    setIsProcessing(true);
    setProcessingStatus('Processing image...');
    
    try {
      const modelService = ModelService.getInstance();
      const result = await modelService.processImage(imageFile);

      const newResult = {
        text: result.text,
        confidence: result.confidence,
        source: (modelService.isEnhanced() ? 'combined' : 'tesseract') as OCRResult['source']
      };

      setOcrResult(newResult);
      setEditableText(newResult.text);
      addEntry(newResult);
      setProcessingStatus('');
    } catch (error) {
      console.error('Processing Error:', error);
      setProcessingStatus('Error processing image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const selectFromHistory = (text: string) => {
    setEditableText(text);
  };

  return (
    <div className="flex">
      <History
        history={history}
        onSelect={selectFromHistory}
        onRemove={removeEntry}
        onClear={clearHistory}
        isOpen={isHistoryOpen}
        onToggle={() => setIsHistoryOpen(!isHistoryOpen)}
      />

      <div className={`flex-1 min-h-screen bg-[var(--cream-bg)] transition-all duration-300 ${isHistoryOpen ? 'ml-64' : 'ml-0'}`}>
        <Navbar />
        <div className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 paper-card p-8">
              <h1 className="mt-3 text-4xl font-bold text-[var(--text-brown)] italic">
                ScribeLens: Handwritten Text Recognition
              </h1>
              <p className="mt-4 text-lg text-[var(--text-brown)] opacity-80">
                Upload an image containing handwritten text to convert it into
                digital format using advanced OCR technology
              </p>
              {modelStatus && (
                <div className={`mt-4 p-3 rounded-lg ${
                  modelStatus.includes('Error') 
                    ? 'bg-red-100 text-red-700' 
                    : 'bg-green-100 text-green-700'
                }`}>
                  <p className="flex items-center justify-center">
                    {modelStatus.includes('Error') && (
                      <AlertCircle className="h-5 w-5 mr-2" />
                    )}
                    {modelStatus}
                  </p>
                </div>
              )}
            </div>

            <div className="notebook-paper p-8">
              {uploadError && (
                <div className="mb-6 p-3 rounded-lg bg-red-100 text-red-700">
                  <p className="flex items-center justify-center text-center">
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    {uploadError}
                  </p>
                </div>
              )}
              <div
                className="border-2 border-dashed border-[var(--text-brown)] rounded-lg p-12 text-center bg-[var(--paper-bg)]"
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) {
                    loadAndProcessFile(file);
                  }
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                {!image ? (
                  <>
                    <Upload className="mx-auto h-16 w-16 text-[var(--text-brown)] opacity-60" />
                    <div className="mt-6">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="upload-button px-6 py-3 text-lg font-medium rounded-xl"
                      >
                        Select Image
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                    <p className="mt-4 text-lg text-[var(--text-brown)] opacity-70">
                      or drag and drop your image here
                    </p>
                  </>
                ) : (
                  <div className="relative">
                    <img
                      src={image}
                      alt="Uploaded"
                      className="max-h-96 mx-auto rounded-lg shadow-lg"
                    />
                    <button
                      onClick={handleReselect}
                      className="absolute top-4 right-4 upload-button p-2 rounded-full bg-white shadow-lg hover:bg-[var(--cream-bg)]"
                      title="Select new image"
                    >
                      <RefreshCw className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>

              {isProcessing && (
                <div className="mt-8 text-center">
                  <Loader2 className="animate-spin h-10 w-10 mx-auto text-[var(--text-brown)]" />
                  <p className="mt-4 text-lg text-[var(--text-brown)] opacity-70">
                    {processingStatus}
                  </p>
                </div>
              )}

              {ocrResult && (
                <div className="mt-8">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-xl font-medium text-[var(--text-brown)]">
                        Recognized Text
                      </h3>
                      <p className="text-sm text-[var(--text-brown)] opacity-70">
                        Confidence: {ocrResult.confidence.toFixed(1)}%
                      </p>
                    </div>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => navigator.clipboard.writeText(editableText)}
                        className="upload-button px-4 py-2 rounded-lg flex items-center"
                      >
                        <Copy className="h-5 w-5 mr-2" />
                        Copy
                      </button>
                      <button
                        onClick={() => {
                          const blob = new Blob([editableText], {
                            type: 'text/plain',
                          });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'ocr-result.txt';
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                        }}
                        className="upload-button px-4 py-2 rounded-lg flex items-center"
                      >
                        <Download className="h-5 w-5 mr-2" />
                        Download
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={editableText}
                    onChange={(e) => setEditableText(e.target.value)}
                    className="block w-full rounded-xl p-4 bg-[var(--paper-bg)] border-2 border-[var(--text-brown)] text-[var(--text-brown)] min-h-[200px] shadow-inner"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        <Features />
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainContent />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
}

export default App;