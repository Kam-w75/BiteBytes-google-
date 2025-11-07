import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { CpuChipIcon, ArrowPathIcon, CheckCircleIcon, XCircleIcon } from './Icons';

export const ReportIssueForm: React.FC = () => {
    const [reportType, setReportType] = useState<'bug' | 'feature' | 'feedback'>('bug');
    const [description, setDescription] = useState('');
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleEnhance = async () => {
        if (!description) {
            setError('Please write a description first.');
            return;
        }
        setIsEnhancing(true);
        setError('');
        try {
            if (!process.env.API_KEY) throw new Error("API key not set");
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            const prompt = `You are an expert product manager's assistant. A user has submitted the following feedback for a recipe costing app: "${description}". The type of feedback is: ${reportType}. Rewrite this feedback to be more structured and actionable for an engineering team. Add sections like 'Summary', 'Details', 'Steps to Reproduce' (for bugs), or 'User Goal' (for features). Keep it professional and clear, based only on the user's text. Format it cleanly.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            setDescription(response.text);

        } catch (e: any) {
            setError('Could not enhance the description. Please try again.');
            console.error(e);
        } finally {
            setIsEnhancing(false);
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description) {
            setError('Please provide a description.');
            return;
        }
        setIsSubmitting(true);
        setError('');
        setSuccess('');

        // Simulate API call
        await new Promise(res => setTimeout(res, 1000));
        
        setIsSubmitting(false);
        setSuccess('Your feedback has been submitted successfully. Thank you!');
        setDescription('');
        setReportType('bug');

        setTimeout(() => setSuccess(''), 5000);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="report-type" className="block text-sm font-medium text-gray-300">
                    Type of Feedback
                </label>
                <select
                    id="report-type"
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value as any)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 bg-[#1E1E1E] text-white border border-[#444444] focus:outline-none focus:ring-[#FF6B6B] focus:border-[#FF6B6B] sm:text-sm rounded-md"
                >
                    <option value="bug">Bug Report</option>
                    <option value="feature">Feature Request</option>
                    <option value="feedback">General Feedback</option>
                </select>
            </div>

            <div>
                 <label htmlFor="description" className="block text-sm font-medium text-gray-300">
                    Description
                </label>
                <textarea
                    id="description"
                    rows={8}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Please describe the issue or your idea in detail..."
                    className="mt-1 block w-full bg-[#1E1E1E] text-white border border-[#444444] rounded-md shadow-sm focus:ring-[#FF6B6B] focus:border-[#FF6B6B] sm:text-sm"
                />
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                 <button
                    type="button"
                    onClick={handleEnhance}
                    disabled={isEnhancing || !description}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-black bg-[#FF6B6B]/80 hover:bg-[#FF6B6B] disabled:bg-gray-500/50 disabled:cursor-not-allowed"
                >
                    {isEnhancing ? <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-5 w-5" /> : <CpuChipIcon className="-ml-1 mr-2 h-5 w-5" />}
                    {isEnhancing ? 'Enhancing...' : 'Enhance with AI'}
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2 border border-transparent text-sm font-semibold rounded-md shadow-sm text-black bg-[#FF6B6B] hover:bg-[#E85A5A] disabled:bg-gray-500"
                >
                     {isSubmitting && <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-5 w-5" />}
                    Submit Feedback
                </button>
            </div>

            {error && (
                 <div className="rounded-md bg-red-900/50 p-3 mt-4">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <XCircleIcon className="h-5 w-5 text-red-400" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-300">{error}</p>
                        </div>
                    </div>
                </div>
            )}
             {success && (
                 <div className="rounded-md bg-green-900/50 p-3 mt-4">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <CheckCircleIcon className="h-5 w-5 text-green-400" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-green-300">{success}</p>
                        </div>
                    </div>
                </div>
            )}
        </form>
    );
};