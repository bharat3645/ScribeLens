import * as tf from '@tensorflow/tfjs';
import { createWorker, OEM, PSM, type Worker as TesseractWorker } from 'tesseract.js';
import { postProcessText } from '../utils/textCleanup';

interface OCRResult {
  text: string;
  confidence: number;
}

export class ModelService {
  private static instance: ModelService;
  private tfModel: tf.LayersModel | null = null;
  private tesseractWorker: TesseractWorker | null = null;
  private useTfModel: boolean = false;

  /** Resolves once initialization has finished (successfully or not). */
  public readonly ready: Promise<void>;

  private constructor() {
    this.ready = this.initializeModels();
  }

  public static getInstance(): ModelService {
    if (!ModelService.instance) {
      ModelService.instance = new ModelService();
    }
    return ModelService.instance;
  }

  private async initializeModels(): Promise<void> {
    // Tesseract.js v5 workers come pre-loaded/pre-initialized for the
    // requested language, so we configure recognition parameters via
    // `setParameters` instead of the (now deprecated, no-op) `loadLanguage`
    // / `initialize` methods.
    this.tesseractWorker = await createWorker('eng', OEM.TESSERACT_LSTM_COMBINED, {
      logger: () => {},
    });
    await this.tesseractWorker.setParameters({
      tessedit_char_whitelist:
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,!? ',
      tessedit_pageseg_mode: PSM.AUTO_OSD,
    });
    console.log('Tesseract initialized successfully');

    // Optional: an in-browser TensorFlow model can be dropped into
    // `public/models/model.json` to augment recognition. This is entirely
    // optional -- when absent, the app runs on Tesseract alone.
    try {
      this.tfModel = await tf.loadLayersModel('/models/model.json');
      this.useTfModel = true;
      console.log('TensorFlow model loaded successfully');
    } catch {
      console.info('No optional TensorFlow model found, using Tesseract only.');
      this.useTfModel = false;
    }
  }

  /** True when the optional TensorFlow model was found and loaded. */
  public isEnhanced(): boolean {
    return this.useTfModel;
  }

  /**
   * Draws the uploaded image onto a canvas and applies a grayscale +
   * contrast pass, which meaningfully improves Tesseract's accuracy on
   * photographed/handwritten text compared to feeding it the raw image.
   */
  private async preprocessImage(imageFile: File): Promise<HTMLCanvasElement> {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'));
      reader.readAsDataURL(imageFile);
    });

    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Failed to load image'));
      image.src = dataUrl;
    });

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Unable to acquire 2D canvas context for preprocessing');
    }
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const { data } = imageData;
    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      const contrasted = Math.min(255, Math.max(0, (gray - 128) * 1.2 + 128));
      data[i] = contrasted;
      data[i + 1] = contrasted;
      data[i + 2] = contrasted;
    }
    ctx.putImageData(imageData, 0, 0);

    return canvas;
  }

  private async processWithTesseract(image: HTMLCanvasElement): Promise<OCRResult> {
    if (!this.tesseractWorker) {
      throw new Error('Tesseract is not initialized yet');
    }

    const result = await this.tesseractWorker.recognize(image);
    return {
      text: result.data.text.trim(),
      confidence: result.data.confidence,
    };
  }

  public async processImage(imageFile: File): Promise<OCRResult> {
    // Make sure model initialization has completed (and didn't fail)
    // before attempting to process anything.
    await this.ready;

    const canvas = await this.preprocessImage(imageFile);
    const tesseractResult = await this.processWithTesseract(canvas);
    const processedText = postProcessText(tesseractResult.text);

    return {
      text: processedText,
      confidence: tesseractResult.confidence,
    };
  }

  public async terminate(): Promise<void> {
    if (this.tfModel) {
      this.tfModel.dispose();
    }
    if (this.tesseractWorker) {
      await this.tesseractWorker.terminate();
    }
  }
}
