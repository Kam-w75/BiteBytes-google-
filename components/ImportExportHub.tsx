import React from 'react';
import { Header } from './Header';
import { 
    FolderIcon, 
    ClipboardDocumentListIcon, 
    DocumentDuplicateIcon 
} from './Icons';

const ImportTile: React.FC<{
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    buttonText: string;
    infoText: string;
}> = ({ icon, title, subtitle, buttonText, infoText }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center text-center hover:shadow-md transition-shadow">
        <div className="bg-blue-100 p-4 rounded-full text-blue-600 mb-4">
            {icon}
        </div>
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-500 mt-1 mb-4 flex-grow">{subtitle}</p>
        <button className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700">
            {buttonText}
        </button>
        <p className="text-xs text-gray-400 mt-3">{infoText}</p>
    </div>
);

const ExportRow: React.FC<{
    title: string;
    subtitle?: string;
    children: React.ReactNode;
}> = ({ title, subtitle, children }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between">
        <div>
            <h4 className="font-bold text-gray-800">{title}</h4>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
            {children}
        </div>
    </div>
);

export const ImportExportHub: React.FC = () => {
    const formatButtons = (
        <>
            <button className="px-3 py-1 text-xs font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Excel</button>
            <button className="px-3 py-1 text-xs font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">CSV</button>
            <button className="px-3 py-1 text-xs font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">PDF</button>
        </>
    );

    return (
        <div>
            <Header
                title="Import / Export Hub"
                subtitle="Easily move your data in and out of the application."
            />
            <div className="p-6 max-w-6xl mx-auto space-y-12">
                {/* --- IMPORT SECTION --- */}
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Import Data</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <ImportTile
                            icon={<FolderIcon className="h-8 w-8" />}
                            title="Upload Order Guide"
                            subtitle="Sysco, US Foods, etc."
                            buttonText="Choose File"
                            infoText="Formats: .xlsx, .csv, .pdf"
                        />
                        <ImportTile
                            icon={<ClipboardDocumentListIcon className="h-8 w-8" />}
                            title="Import Recipes"
                            subtitle="From spreadsheet or another app. Download our template to get started."
                            buttonText="Choose File"
                            infoText="Download Template"
                        />
                        <ImportTile
                            icon={<DocumentDuplicateIcon className="h-8 w-8" />}
                            title="Import Invoices"
                            subtitle="Bulk upload multiple invoices to quickly update your costs."
                            buttonText="Choose Files"
                            infoText="Formats: .pdf, .jpg, .png"
                        />
                    </div>
                </section>

                {/* --- EXPORT SECTION --- */}
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Export Data</h2>
                    <div className="space-y-4">
                        <ExportRow title="Ingredients">{formatButtons}</ExportRow>
                        <ExportRow title="Recipes">{formatButtons}</ExportRow>
                        <ExportRow title="Reports" subtitle="Weekly/Monthly cost analysis">
                            <select className="px-3 py-1 text-xs font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 border-none focus:ring-0">
                                <option>Weekly Report</option>
                                <option>Monthly Report</option>
                            </select>
                            <button className="px-3 py-1 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">Export</button>
                        </ExportRow>
                        <ExportRow title="Full Backup" subtitle="Download all your data in a single zip file.">
                             <button className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-md shadow-sm hover:bg-green-700">
                                Download Backup
                            </button>
                        </ExportRow>
                    </div>
                </section>
                
                {/* --- INTEGRATIONS SECTION --- */}
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Integrations</h2>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
                        <h3 className="text-lg font-semibold text-gray-800">Direct Integrations Coming Soon!</h3>
                        <p className="text-sm text-gray-500 mt-2">We're working on connecting directly with your favorite services.</p>
                        <div className="flex justify-center items-center space-x-8 mt-6">
                            <div className="flex items-center justify-center h-16 w-32 bg-gray-100 rounded-md text-gray-500 font-bold">Toast</div>
                            <div className="flex items-center justify-center h-16 w-32 bg-gray-100 rounded-md text-gray-500 font-bold">QuickBooks</div>
                            <div className="flex items-center justify-center h-16 w-32 bg-gray-100 rounded-md text-gray-500 font-bold">Square</div>
                        </div>
                        <button className="mt-8 px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700">
                            Get notified when available
                        </button>
                    </div>
                </section>

            </div>
        </div>
    );
};
