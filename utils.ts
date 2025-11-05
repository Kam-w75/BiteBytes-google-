// This file can be used for utility functions.

// Helper function to trigger file download
export const downloadFile = (content: string, fileName: string, contentType: string) => {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
};

// Generic CSV converter
export function arrayToCsv(data: Record<string, any>[]): string {
    if (data.length === 0) return '';
    
    const columns = Object.keys(data[0]);
    const header = columns.map(c => `"${c}"`).join(',');

    const rows = data.map(row => {
        return columns.map(colName => {
            let cell = row[colName];
            if (cell === null || cell === undefined) {
                return '';
            }
            if (typeof cell === 'object') {
                cell = JSON.stringify(cell);
            }
            const cellStr = String(cell);
            // Escape double quotes by doubling them and wrap the whole cell in double quotes
            return `"${cellStr.replace(/"/g, '""')}"`;
        }).join(',');
    });

    return [header, ...rows].join('\n');
}
