import React, { useRef, useState } from 'react';
import { Header } from './Header';
import { 
    FolderIcon, 
    ClipboardDocumentListIcon, 
    DocumentDuplicateIcon 
} from './Icons';
import { Ingredient, Recipe, Vendor } from '../types';
import { downloadFile, arrayToCsv } from '../utils';


interface ImportExportHubProps {
    ingredients: Ingredient[];
    recipes: Recipe[];
    vendors: Vendor[];
}

export const ImportExportHub: React.FC<ImportExportHubProps> = ({ ingredients, recipes, vendors }) => {
    const orderGuideRef = useRef<HTMLInputElement>(null);
    const recipesRef = useRef<HTMLInputElement>(null);
    const invoicesRef = useRef<HTMLInputElement>(null);

    const [importStatus, setImportStatus] = useState({
        orderGuide: '',
        recipes: '',
        invoices: '',
    });

    const handleFileChange = (
        event: React.ChangeEvent<HTMLInputElement>,
        type: keyof typeof importStatus
    ) => {
        const file = event.target.files?.[0];
        if (file) {
            setImportStatus(prev => ({ ...prev, [type]: file.name }));
        }
    };

    const handleDownloadTemplate = () => {
        const templateData = `"name","servings","menuPrice","laborTimeMinutes","instructions","ingredients"\n"Example Pizza","1","15.00","5","1. Stretch dough.\\n2. Add toppings.\\n3. Bake.","[{""name"":""Pizza Dough"",""quantity"":1,""unit"":""each""},{""name"":""Tomato Sauce"",""quantity"":0.25,""unit"":""cup""}]"`;
        downloadFile(templateData, 'recipe_template.csv', 'text/csv;charset=utf-8;');
    };

    const handleExportIngredients = (format: 'csv' | 'pdf') => {
        const data = ingredients.map(({ priceTrend, usedInRecipes, ...rest }) => rest); // Omit transient fields
        const csvData = arrayToCsv(data);
        const fileName = `ingredients_export.${format === 'csv' ? 'csv' : 'txt'}`;
        const mimeType = format === 'csv' ? 'text/csv;charset=utf-8;' : 'text/plain;charset=utf-8;';
        downloadFile(csvData, fileName, mimeType);
    };

    const handleExportRecipes = (format: 'csv' | 'pdf') => {
        // A simplified version for export, stringifying nested ingredients
        const dataToExport = recipes.map(r => ({
            ...r,
            ingredients: JSON.stringify(r.ingredients),
        }));
        const csvData = arrayToCsv(dataToExport);
        const fileName = `recipes_export.${format === 'csv' ? 'csv' : 'txt'}`;
        const mimeType = format === 'csv' ? 'text/csv;charset=utf-8;' : 'text/plain;charset=utf-8;';
        downloadFile(csvData, fileName, mimeType);
    };

    const handleExportBackup = () => {
        const backupData = {
            ingredients,
            recipes,
            vendors,
            exportDate: new Date().toISOString(),
        };
        const jsonString = JSON.stringify(backupData, null, 2);
        downloadFile(jsonString, `bitebytes_backup_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
    };


    const ExportButtons: React.FC<{ onExport: (format: 'csv' | 'pdf') => void }> = ({ onExport }) => (
        <>
            <button onClick={() => onExport('csv')} className="px-3 py-1 text-xs font-semibold text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600">Excel/CSV</button>
            <button onClick={() => onExport('pdf')} className="px-3 py-1 text-xs font-semibold text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600">PDF</button>
        </>
    );

    return (
        <div>
            <Header
                title="Import / Export Hub"
                subtitle="Easily move your data in and out of the application."
            />
            <div className="p-6 max-w-6xl mx-auto space-y-12">
                <section>
                    <h2 className="text-2xl font-bold text-gray-100 mb-6">Import Data</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Order Guide Import */}
                        <div className="bg-[#2C2C2C] p-6 rounded-lg shadow-sm border border-[#444444] flex flex-col items-center text-center hover:shadow-lg hover:border-gray-600 transition-shadow">
                            <div className="bg-[#FF6B6B]/10 p-4 rounded-full text-[#FF6B6B] mb-4"><FolderIcon className="h-8 w-8" /></div>
                            <h3 className="text-lg font-bold text-gray-200">Upload Order Guide</h3>
                            <p className="text-sm text-gray-400 mt-1 mb-4 flex-grow">Sysco, US Foods, etc.</p>
                            <input type="file" ref={orderGuideRef} onChange={(e) => handleFileChange(e, 'orderGuide')} className="hidden" accept=".csv,.xlsx,.pdf" />
                            <button onClick={() => orderGuideRef.current?.click()} className="w-full px-4 py-2 font-semibold text-black bg-[#FF6B6B] rounded-md shadow-sm hover:bg-[#E85A5A]">
                                {importStatus.orderGuide ? 'File Selected!' : 'Choose File'}
                            </button>
                            <p className="text-xs text-gray-500 mt-3 truncate w-full px-2" title={importStatus.orderGuide}>{importStatus.orderGuide || 'Formats: .xlsx, .csv, .pdf'}</p>
                        </div>
                        {/* Recipe Import */}
                        <div className="bg-[#2C2C2C] p-6 rounded-lg shadow-sm border border-[#444444] flex flex-col items-center text-center hover:shadow-lg hover:border-gray-600 transition-shadow">
                            <div className="bg-[#FF6B6B]/10 p-4 rounded-full text-[#FF6B6B] mb-4"><ClipboardDocumentListIcon className="h-8 w-8" /></div>
                            <h3 className="text-lg font-bold text-gray-200">Import Recipes</h3>
                            <p className="text-sm text-gray-400 mt-1 mb-4 flex-grow">From spreadsheet or another app.</p>
                            <input type="file" ref={recipesRef} onChange={(e) => handleFileChange(e, 'recipes')} className="hidden" accept=".csv" />
                             <button onClick={() => recipesRef.current?.click()} className="w-full px-4 py-2 font-semibold text-black bg-[#FF6B6B] rounded-md shadow-sm hover:bg-[#E85A5A]">
                                {importStatus.recipes ? 'File Selected!' : 'Choose File'}
                            </button>
                            <button onClick={handleDownloadTemplate} className="text-xs text-[#FF6B6B] hover:underline mt-3">{importStatus.recipes || 'Download Template'}</button>
                        </div>
                         {/* Invoice Import */}
                        <div className="bg-[#2C2C2C] p-6 rounded-lg shadow-sm border border-[#444444] flex flex-col items-center text-center hover:shadow-lg hover:border-gray-600 transition-shadow">
                            <div className="bg-[#FF6B6B]/10 p-4 rounded-full text-[#FF6B6B] mb-4"><DocumentDuplicateIcon className="h-8 w-8" /></div>
                            <h3 className="text-lg font-bold text-gray-200">Import Invoices</h3>
                            <p className="text-sm text-gray-400 mt-1 mb-4 flex-grow">Bulk upload multiple invoices to quickly update your costs.</p>
                            <input type="file" ref={invoicesRef} onChange={(e) => handleFileChange(e, 'invoices')} className="hidden" accept=".pdf,.jpg,.png" multiple />
                            <button onClick={() => invoicesRef.current?.click()} className="w-full px-4 py-2 font-semibold text-black bg-[#FF6B6B] rounded-md shadow-sm hover:bg-[#E85A5A]">
                                {importStatus.invoices ? 'File(s) Selected!' : 'Choose Files'}
                            </button>
                            <p className="text-xs text-gray-500 mt-3 truncate w-full px-2" title={importStatus.invoices}>{importStatus.invoices || 'Formats: .pdf, .jpg, .png'}</p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-gray-100 mb-6">Export Data</h2>
                    <div className="space-y-4">
                        <div className="bg-[#2C2C2C] p-4 rounded-lg shadow-sm border border-[#444444] flex flex-col sm:flex-row sm:items-center justify-between">
                            <div><h4 className="font-bold text-gray-200">Ingredients</h4></div>
                            <div className="mt-4 sm:mt-0 flex items-center space-x-2"><ExportButtons onExport={handleExportIngredients} /></div>
                        </div>
                         <div className="bg-[#2C2C2C] p-4 rounded-lg shadow-sm border border-[#444444] flex flex-col sm:flex-row sm:items-center justify-between">
                            <div><h4 className="font-bold text-gray-200">Recipes</h4></div>
                            <div className="mt-4 sm:mt-0 flex items-center space-x-2"><ExportButtons onExport={handleExportRecipes} /></div>
                        </div>
                        <div className="bg-[#2C2C2C] p-4 rounded-lg shadow-sm border border-[#444444] flex flex-col sm:flex-row sm:items-center justify-between">
                            <div>
                                <h4 className="font-bold text-gray-200">Full Backup</h4>
                                <p className="text-sm text-gray-400 mt-1">Download all your data in a single JSON file.</p>
                            </div>
                            <div className="mt-4 sm:mt-0">
                                <button onClick={handleExportBackup} className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-md shadow-sm hover:bg-green-700">
                                    Download Backup
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
                
                <section>
                    <h2 className="text-2xl font-bold text-gray-100 mb-6">Integrations</h2>
                    <div className="bg-[#2C2C2C] p-6 rounded-lg shadow-sm border border-[#444444] text-center">
                        <h3 className="text-lg font-semibold text-gray-200">Direct Integrations Coming Soon!</h3>
                        <p className="text-sm text-gray-400 mt-2">We're working on connecting directly with your favorite services.</p>
                        <div className="flex justify-center items-center space-x-8 mt-6">
                            <div className="flex items-center justify-center h-16 w-32 bg-gray-700 rounded-md text-gray-400 font-bold">Toast</div>
                            <div className="flex items-center justify-center h-16 w-32 bg-gray-700 rounded-md text-gray-400 font-bold">QuickBooks</div>
                            <div className="flex items-center justify-center h-16 w-32 bg-gray-700 rounded-md text-gray-400 font-bold">Square</div>
                        </div>
                        <button className="mt-8 px-5 py-2 text-sm font-semibold text-black bg-[#FF6B6B] rounded-md shadow-sm hover:bg-[#E85A5A]">
                            Get notified when available
                        </button>
                    </div>
                </section>

            </div>
        </div>
    );
};