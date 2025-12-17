import React, { useState, useEffect } from 'react';
import { Contact } from './types';
import { ImageUploader } from './components/ImageUploader';
import { ContactList } from './components/ContactList';
import { Stats } from './components/Stats';
import { LayoutDashboard, Phone, List } from 'lucide-react';

const STORAGE_KEY = 'fotocall_contacts_v1';

const App: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeTab, setActiveTab] = useState<'upload' | 'list'>('upload');

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setContacts(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load contacts", e);
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
  }, [contacts]);

  const handleContactsAdded = (newContacts: Contact[]) => {
    setContacts(prev => [...newContacts, ...prev]);
    setActiveTab('list');
  };

  const handleUpdateContact = (updatedContact: Contact) => {
    setContacts(prev => prev.map(c => c.id === updatedContact.id ? updatedContact : c));
  };

  const handleDeleteContact = (id: string) => {
    if (confirm("Are you sure you want to delete this contact?")) {
      setContacts(prev => prev.filter(c => c.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                FotoCall CRM
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setActiveTab('upload')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'upload' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Upload & Extract
              </button>
              <button 
                onClick={() => setActiveTab('list')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'list' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-900'}`}
              >
                CRM Dashboard
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Intro / Stats */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {activeTab === 'upload' ? 'Digitize Your Leads' : 'Manage Calls'}
          </h1>
          <p className="text-slate-500">
            {activeTab === 'upload' 
              ? 'Upload images of lists, business cards, or screens to automatically extract contact details.' 
              : 'Track your progress, make calls, and close deals.'}
          </p>
        </div>

        {activeTab === 'upload' && (
          <div className="animate-fade-in-up">
            <ImageUploader onContactsAdded={handleContactsAdded} />
            
            {/* Quick Recent Preview if any */}
            {contacts.length > 0 && (
              <div className="mt-12">
                 <h3 className="text-lg font-semibold text-slate-700 mb-4">Quick Stats</h3>
                 <Stats contacts={contacts} />
                 <div className="text-center mt-4">
                   <button onClick={() => setActiveTab('list')} className="text-blue-600 font-medium hover:underline">
                     View all {contacts.length} contacts &rarr;
                   </button>
                 </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'list' && (
          <div className="animate-fade-in-up space-y-8">
            <Stats contacts={contacts} />
            <ContactList 
              contacts={contacts} 
              onUpdateContact={handleUpdateContact}
              onDeleteContact={handleDeleteContact}
            />
          </div>
        )}

      </main>
    </div>
  );
};

export default App;