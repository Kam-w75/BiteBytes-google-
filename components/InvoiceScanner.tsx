import React, { useState, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Header } from './Header';
// FIX: Corrected import path for ScannedItem type.
import { ScannedItem } from '../types';
// FIX: Corrected import path for Icons.
import { UploadIcon, SparklesIcon, XCircleIcon, CheckCircleIcon, ArrowPathIcon } from './Icons';

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

const getConfidenceColor = (score?: number) => {
  if (score === undefined) return 'bg-gray-400';
  if (score >= 0.9) return 'bg-green-500';
  if (score >= 0.7) return 'bg-yellow-500';
  return 'bg-red-500';
};

const getConfidenceTextColor = (score?: number) => {
  if (score === undefined) return 'text-gray-400';
  if (score >= 0.9) return 'text-green-600';
  if (score >= 0.7) return 'text-yellow-600';
  return 'text-red-600';
};


export const InvoiceScanner: React.FC = () => {
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    setIsLoading(true);
    setError(null);
    setScannedItems([]);

    try {
      if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const imagePart = await fileToGenerativePart(file);

      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: {
              parts: [
                  imagePart,
                  { text: "Extract all line items from this invoice. For each item, provide: 1. A clean, normalized item name. 2. The quantity as a number. 3. The price per item or per unit. 4. The unit of measure (e.g., 'kg', 'lb', 'oz', 'liter', 'each'). Normalize common abbreviations. 5. A confidence score from 0.0 to 1.0 indicating how certain you are about the extracted data for this line item." }
              ]
          },
          config: {
              responseMimeType: "application/json",
              responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                      items: {
                          type: Type.ARRAY,
                          items: {
                              type: Type.OBJECT,
                              properties: {
                                  itemName: { type: Type.STRING },
                                  quantity: { type: Type.NUMBER },
                                  price: { type: Type.NUMBER },
                                  unit: { type: Type.STRING },
                                  confidence: { type: Type.NUMBER, description: "Confidence score from 0.0 to 1.0" }
                              },
                              
                              required: ["itemName", "quantity", "price", "unit", "confidence"]
                          }
                      }
                  }
              }
          }
      });
      
      const parsedResponse = JSON.parse(response.text);
      if (parsedResponse.items && Array.isArray(parsedResponse.items)) {
        setScannedItems(parsedResponse.items);
      } else {
        throw new Error("Invalid response format from API.");
      }

    } catch (e: any) {
      setError(`Failed to process invoice: ${e.message}`);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <Header
        title="Scan Invoice"
        subtitle="Upload an image of your invoice to automatically add ingredients and their costs."
      />
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-white">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
              capture="environment"
            />
            {imagePreview ? (
              <img src={imagePreview} alt="Invoice preview" className="max-h-64 mx-auto mb-4 rounded-lg shadow-md" />
            ) : (
                <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
            )}
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {isLoading ? "Analyzing Invoice..." : "Upload an invoice"}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Use your camera or upload a file.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={handleUploadClick}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
              >
                {isLoading ? <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-5 w-5" /> : <SparklesIcon className="-ml-1 mr-2 h-5 w-5" />}
                {isLoading ? 'Processing...' : 'Scan with Gemini'}
              </button>
            </div>
          </div>
          
          {error && (
            <div className="mt-6 rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <XCircleIcon className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {scannedItems.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Extracted Items</h3>
              <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
                <ul role="list" className="divide-y divide-gray-200">
                  {scannedItems.map((item, index) => (
                    <li key={index} className="px-4 py-4 sm:px-6 flex items-center justify-between gap-4">
                       <div className="flex items-center flex-1 min-w-0">
                          <div className={`w-2.5 h-2.5 rounded-full mr-3 flex-shrink-0 ${getConfidenceColor(item.confidence)}`}></div>
                          <div className="min-w-0">
                              <p className="text-sm font-medium text-blue-600 truncate">{item.itemName}</p>
                              <p className="mt-1 text-sm text-gray-500">{item.quantity} {item.unit || ''}</p>
                          </div>
                        </div>
                      <div className="text-right flex-shrink-0">
                         <p className="text-sm font-medium text-gray-900">${item.price.toFixed(2)}</p>
                         {item.confidence !== undefined && (
                            <p className={`mt-1 text-xs font-bold ${getConfidenceTextColor(item.confidence)}`}>
                                {(item.confidence * 100).toFixed(0)}% Conf.
                            </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                    <CheckCircleIcon className="-ml-1 mr-2 h-5 w-5" />
                    Add to Inventory
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
