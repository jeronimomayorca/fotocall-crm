
import React, { useState, useEffect } from 'react';
import { Contact, CallStatus } from '../types';
import { ImageUploader } from '../components/ImageUploader';
import { ContactList } from '../components/ContactList';
import { Stats } from '../components/Stats';
import { Phone, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';

export const Dashboard: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeTab, setActiveTab] = useState<'upload' | 'list'>('upload');
  const [loading, setLoading] = useState(true);
  const { signOut, user } = useAuth();

  useEffect(() => {
    fetchContacts();
  }, [user]);

  const fetchContacts = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('imported_at', { ascending: false });

      if (error) throw error;
      
      // Map database fields to frontend types if necessary (snake_case to camelCase)
      // Assuming Supabase returns exactly what matches our types mostly
      // But we need to be careful with camelCase vs snake_case if we didn't define it strictly.
      // For now assuming the table columns match the types or we map them.
      // Let's assume we used snake_case in DB but types are camelCase.
      
      const mappedContacts: Contact[] = (data || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        phone: row.phone,
        company: row.company,
        notes: row.notes,
        status: row.status as CallStatus,
        importedAt: row.imported_at,
      }));

      setContacts(mappedContacts);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContactsAdded = async (newContacts: Contact[]) => {
    if (!user) return;

    // Prepare data for Supabase (convert to snake_case if needed)
    const contactsToInsert = newContacts.map(c => ({
      user_id: user.id,
      name: c.name,
      phone: c.phone,
      company: c.company,
      notes: c.notes,
      status: c.status,
      imported_at: c.importedAt
    }));

    try {
      const { error } = await supabase.from('contacts').insert(contactsToInsert);
      if (error) throw error;
      
      // Refresh local state
      fetchContacts();
      setActiveTab('list');
    } catch (error) {
      console.error('Error saving contacts:', error);
      alert('Failed to save contacts to database.');
    }
  };

  const handleUpdateContact = async (updatedContact: Contact) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .update({
          name: updatedContact.name,
          phone: updatedContact.phone,
          company: updatedContact.company,
          notes: updatedContact.notes,
          status: updatedContact.status,
        })
        .eq('id', updatedContact.id);

      if (error) throw error;

      setContacts(prev => prev.map(c => c.id === updatedContact.id ? updatedContact : c));
    } catch (error) {
      console.error('Error updating contact:', error);
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (confirm("Are you sure you want to delete this contact?")) {
      try {
        const { error } = await supabase
          .from('contacts')
          .delete()
          .eq('id', id);

        if (error) throw error;

        setContacts(prev => prev.filter(c => c.id !== id));
      } catch (error) {
        console.error('Error deleting contact:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-inter">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
                FotoCall CRM
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setActiveTab('upload')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'upload' 
                    ? 'bg-blue-50 text-blue-700 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Upload & Extract
              </button>
              <button 
                onClick={() => setActiveTab('list')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'list' 
                    ? 'bg-blue-50 text-blue-700 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                CRM Dashboard
              </button>
              
              <div className="h-6 w-px bg-slate-200 mx-2"></div>
              
              <button 
                onClick={signOut}
                className="text-slate-500 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Intro / Stats */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">
            {activeTab === 'upload' ? 'Digitize Your Leads' : 'Manage Calls'}
          </h1>
          <p className="text-slate-500 text-lg">
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
                 <h3 className="text-lg font-semibold text-slate-700 mb-4 px-1">Recent Activity</h3>
                 <Stats contacts={contacts} />
                 <div className="text-center mt-6">
                   <button onClick={() => setActiveTab('list')} className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-colors">
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
