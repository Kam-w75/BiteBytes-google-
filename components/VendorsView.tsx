import React, { useState } from 'react';
import { Vendor, Ingredient } from '../types';
import { 
    PlusIcon, 
    CpuChipIcon, 
    StarIcon, 
    PhoneIcon, 
    EnvelopeIcon, 
    PencilSquareIcon,
    TrashIcon,
    XMarkIcon
} from './Icons';

interface VendorsViewProps {
  vendors: Vendor[];
  ingredients: Ingredient[];
  onSaveVendor: (vendor: Vendor) => void;
  onDeleteVendor: (vendorId: string) => void;
  onAddIngredientForVendor: (vendorId: string) => void;
}

interface VendorCardProps {
    vendor: Vendor;
    ingredients: Ingredient[];
    onEdit: (vendor: Vendor) => void;
    onDelete: (vendorId: string) => void;
    onAddIngredient: (vendorId: string) => void;
}

const VendorCard: React.FC<VendorCardProps> = ({ vendor, ingredients, onEdit, onDelete, onAddIngredient }) => {
    
    const getInitials = (name: string) => {
        const parts = name.split(' ');
        if (parts.length > 1 && parts[1]) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }
    
    const totalValue = ingredients.reduce((sum, item) => sum + item.cost, 0);

    return (
        <div className="bg-[#2C2C2C] rounded-lg shadow-sm border border-[#444444] flex flex-col hover:shadow-lg hover:border-gray-600 transition-all duration-200">
            {/* Header */}
            <div className="p-4 border-b border-[#444444] flex items-center justify-between">
                <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-[#FF6B6B]/20 text-[#FF6B6B] flex items-center justify-center font-bold text-lg mr-3">
                        {getInitials(vendor.name)}
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-gray-100">{vendor.name}</h3>
                        <p className="text-xs text-gray-400">{vendor.type}</p>
                    </div>
                </div>
                {vendor.isPrimary && (
                    <div className="flex items-center text-xs font-semibold bg-yellow-900/50 text-yellow-300 px-2 py-1 rounded-full">
                        <StarIcon className="w-3 h-3 mr-1" />
                        Primary
                    </div>
                )}
            </div>
            {/* Body */}
            <div className="p-4 space-y-3 flex-grow text-gray-300">
                <div className="text-sm">
                    <p className="font-semibold text-gray-400">Contact</p>
                    <p className="flex items-center mt-1"><EnvelopeIcon className="w-4 h-4 mr-2 text-gray-500"/> {vendor.contact.email}</p>
                    <p className="flex items-center mt-1"><PhoneIcon className="w-4 h-4 mr-2 text-gray-500"/> {vendor.contact.phone} ({vendor.contact.name})</p>
                </div>
                 <div className="text-sm">
                    <p className="font-semibold text-gray-400">Account #</p>
                    <p>{vendor.accountNumber || 'N/A'}</p>
                </div>
                 <div className="text-sm">
                    <p className="font-semibold text-gray-400">Order Days</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                        {vendor.orderDays.map(day => (
                            <span key={day} className="px-2 py-0.5 text-xs bg-gray-700 text-gray-300 rounded-full">{day}</span>
                        ))}
                    </div>
                </div>
                <div className="text-sm">
                    <p className="font-semibold text-gray-400">Supplied Ingredients ({ingredients.length})</p>
                    {ingredients.length > 0 ? (
                        <div className="mt-1 max-h-24 overflow-y-auto pr-2 text-xs space-y-1">
                            {ingredients.map(ing => (
                                <div key={ing.id} className="flex justify-between items-center">
                                    <span className="truncate pr-2">{ing.name}</span>
                                    <span className="flex-shrink-0 font-mono">${ing.cost.toFixed(2)}/{ing.unit}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-gray-500 mt-1">No ingredients mapped to this supplier.</p>
                    )}
                </div>
            </div>
            {/* Footer */}
            <div className="p-4 border-t border-[#444444] bg-[#1E1E1E] rounded-b-lg flex justify-between items-center">
                 <p className="text-sm text-gray-400">
                    Total Value: <span className="font-bold text-gray-200">${totalValue.toFixed(2)}</span>
                </p>
                <div className="flex items-center space-x-2">
                    <button onClick={() => onAddIngredient(vendor.id)} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-600 rounded-md" title="Add Ingredient">
                        <PlusIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => onEdit(vendor)} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-600 rounded-md" title="Edit Supplier">
                        <PencilSquareIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDelete(vendor.id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-900/50 rounded-md" title="Delete Supplier">
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

const AddVendorModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void;
    onSave: (vendor: Vendor) => void;
    vendorToEdit: Vendor | null;
}> = ({ isOpen, onClose, onSave, vendorToEdit }) => {
    if (!isOpen) return null;

    const isEditing = !!vendorToEdit;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const orderDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].filter(day => formData.get(day) === 'on');

        const savedVendor: Vendor = {
            id: vendorToEdit?.id || '', // App.tsx will create an ID for new vendors
            name: formData.get('vendor-name') as string,
            type: formData.get('vendor-type') as Vendor['type'],
            accountNumber: formData.get('account-number') as string,
            contact: {
                name: formData.get('contact-name') as string,
                email: formData.get('contact-email') as string,
                phone: formData.get('contact-phone') as string,
            },
            orderDays: orderDays,
            isPrimary: vendorToEdit?.isPrimary || false,
            lastOrderDate: vendorToEdit?.lastOrderDate || new Date().toISOString().split('T')[0],
            paymentTerms: vendorToEdit?.paymentTerms || 'Net 30',
            totalSpend: vendorToEdit?.totalSpend || 0,
            itemCount: vendorToEdit?.itemCount || 0
        };
        onSave(savedVendor);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-[#2C2C2C] rounded-lg shadow-xl p-6 w-full max-w-lg relative border border-[#444444]">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <XMarkIcon className="h-6 w-6" />
                </button>
                <h2 className="text-xl font-bold text-gray-100 mb-4">{isEditing ? 'Edit Supplier' : 'Add New Supplier'}</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 text-gray-300">
                    <div>
                        <label htmlFor="vendor-name" className="block text-sm font-medium text-gray-400">Supplier Name</label>
                        <input type="text" id="vendor-name" name="vendor-name" defaultValue={vendorToEdit?.name} required className="mt-1 block w-full bg-transparent border-[#444444] rounded-md shadow-sm focus:ring-[#FF6B6B] focus:border-[#FF6B6B]" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="vendor-type" className="block text-sm font-medium text-gray-400">Type</label>
                            <select id="vendor-type" name="vendor-type" defaultValue={vendorToEdit?.type} className="mt-1 block w-full bg-transparent border-[#444444] rounded-md shadow-sm focus:ring-[#FF6B6B] focus:border-[#FF6B6B]">
                                <option>Broadline</option>
                                <option>Produce</option>
                                <option>Specialty</option>
                                <option>Other</option>
                            </select>
                        </div>
                         <div>
                            <label htmlFor="account-number" className="block text-sm font-medium text-gray-400">Account Number</label>
                            <input type="text" id="account-number" name="account-number" defaultValue={vendorToEdit?.accountNumber} className="mt-1 block w-full bg-transparent border-[#444444] rounded-md shadow-sm focus:ring-[#FF6B6B] focus:border-[#FF6B6B]" />
                        </div>
                    </div>
                     <div className="grid grid-cols-3 gap-4">
                         <div className="col-span-1">
                            <label htmlFor="contact-name" className="block text-sm font-medium text-gray-400">Contact Name</label>
                            <input type="text" id="contact-name" name="contact-name" defaultValue={vendorToEdit?.contact.name} required className="mt-1 block w-full bg-transparent border-[#444444] rounded-md shadow-sm focus:ring-[#FF6B6B] focus:border-[#FF6B6B]" />
                         </div>
                         <div className="col-span-2">
                            <label htmlFor="contact-email" className="block text-sm font-medium text-gray-400">Contact Email</label>
                            <input type="email" id="contact-email" name="contact-email" defaultValue={vendorToEdit?.contact.email} required className="mt-1 block w-full bg-transparent border-[#444444] rounded-md shadow-sm focus:ring-[#FF6B6B] focus:border-[#FF6B6B]" />
                         </div>
                    </div>
                     <div>
                        <label htmlFor="contact-phone" className="block text-sm font-medium text-gray-400">Contact Phone</label>
                        <input type="tel" id="contact-phone" name="contact-phone" defaultValue={vendorToEdit?.contact.phone} className="mt-1 block w-full bg-transparent border-[#444444] rounded-md shadow-sm focus:ring-[#FF6B6B] focus:border-[#FF6B6B]" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Order Days</label>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                <label key={day} className="flex-1 text-center min-w-[40px]">
                                    <input type="checkbox" name={day} defaultChecked={vendorToEdit?.orderDays.includes(day)} className="sr-only peer" />
                                    <div className="w-full p-2 border border-[#444444] rounded-md cursor-pointer text-xs peer-checked:bg-[#FF6B6B] peer-checked:text-black peer-checked:border-[#FF6B6B] transition-colors">{day}</div>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button onClick={onClose} type="button" className="px-4 py-2 text-sm font-medium text-gray-300 bg-transparent border border-[#444444] rounded-md shadow-sm hover:bg-gray-700">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-black bg-[#FF6B6B] border border-transparent rounded-md shadow-sm hover:bg-[#E85A5A]">
                            {isEditing ? 'Save Changes' : 'Add Supplier'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export const VendorsView: React.FC<VendorsViewProps> = ({ vendors, ingredients, onSaveVendor, onDeleteVendor, onAddIngredientForVendor }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [vendorToEdit, setVendorToEdit] = useState<Vendor | null>(null);

    const handleEdit = (vendor: Vendor) => {
        setVendorToEdit(vendor);
        setIsModalOpen(true);
    };
    
    const handleAddNew = () => {
        setVendorToEdit(null);
        setIsModalOpen(true);
    };

    const handleDelete = (vendorId: string) => {
        if (window.confirm('Are you sure you want to delete this vendor? This action cannot be undone.')) {
            onDeleteVendor(vendorId);
        }
    };
    
    const handleSave = (vendor: Vendor) => {
        onSaveVendor(vendor);
    };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-300">All Suppliers ({vendors.length})</h2>
        <button
          type="button"
          onClick={handleAddNew}
          className="inline-flex items-center gap-x-1.5 rounded-md bg-[#FF6B6B] px-3 py-2 text-sm font-semibold text-black shadow-sm hover:bg-[#E85A5A]"
        >
          <PlusIcon className="-ml-0.5 h-5 w-5" />
          Add Supplier
        </button>
      </div>

      {/* AI Suggestion */}
      <div className="bg-[#FF6B6B]/10 border border-[#FF6B6B]/20 p-4 rounded-lg flex items-start mb-6">
        <CpuChipIcon className="h-6 w-6 text-[#FF6B6B] mr-4 flex-shrink-0 mt-1" />
        <div>
            <p className="font-semibold text-gray-100">
                I noticed you buy ground beef from both Sysco and US Foods.
            </p>
            <p className="text-sm text-gray-300 mt-1">
                Want me to compare their recent prices for you? <a href="#" className="font-bold underline hover:text-[#FF6B6B]">Yes, show comparison</a>
            </p>
        </div>
      </div>
      
      {/* Vendor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {vendors.map(vendor => {
              const suppliedIngredients = ingredients.filter(ing => ing.vendorId === vendor.id);
              return (
                  <VendorCard 
                    key={vendor.id} 
                    vendor={vendor} 
                    ingredients={suppliedIngredients}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onAddIngredient={onAddIngredientForVendor}
                  />
              )
          })}
      </div>

      <AddVendorModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        vendorToEdit={vendorToEdit}
      />
    </div>
  );
};