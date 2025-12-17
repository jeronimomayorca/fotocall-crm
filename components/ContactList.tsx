import React, { useState } from 'react';
import { Contact, CallStatus } from '../types';
import { Phone, CheckCircle, XCircle, Clock, AlertCircle, Trash2, Edit2, Search } from 'lucide-react';

interface ContactListProps {
  contacts: Contact[];
  onUpdateContact: (contact: Contact) => void;
  onDeleteContact: (id: string) => void;
}

const StatusBadge: React.FC<{ status: CallStatus }> = ({ status }) => {
  const styles = {
    [CallStatus.PENDING]: "bg-slate-100 text-slate-600",
    [CallStatus.CALLED]: "bg-blue-100 text-blue-700",
    [CallStatus.NO_ANSWER]: "bg-amber-100 text-amber-700",
    [CallStatus.INTERESTED]: "bg-emerald-100 text-emerald-700",
    [CallStatus.NOT_INTERESTED]: "bg-red-100 text-red-700",
    [CallStatus.CLOSED]: "bg-violet-100 text-violet-700",
  };

  const icons = {
    [CallStatus.PENDING]: <Clock className="w-3 h-3 mr-1" />,
    [CallStatus.CALLED]: <Phone className="w-3 h-3 mr-1" />,
    [CallStatus.NO_ANSWER]: <AlertCircle className="w-3 h-3 mr-1" />,
    [CallStatus.INTERESTED]: <CheckCircle className="w-3 h-3 mr-1" />,
    [CallStatus.NOT_INTERESTED]: <XCircle className="w-3 h-3 mr-1" />,
    [CallStatus.CLOSED]: <CheckCircle className="w-3 h-3 mr-1" />,
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {icons[status]}
      {status.replace('_', ' ')}
    </span>
  );
};

export const ContactList: React.FC<ContactListProps> = ({ contacts, onUpdateContact, onDeleteContact }) => {
  const [filter, setFilter] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Contact>>({});

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(filter.toLowerCase()) || 
    c.phone.includes(filter) ||
    c.company?.toLowerCase().includes(filter.toLowerCase())
  );

  const handleStatusChange = (contact: Contact, newStatus: CallStatus) => {
    onUpdateContact({
      ...contact,
      status: newStatus,
      lastContacted: newStatus !== CallStatus.PENDING ? new Date().toISOString() : contact.lastContacted
    });
  };

  const startEdit = (contact: Contact) => {
    setEditingId(contact.id);
    setEditForm(contact);
  };

  const saveEdit = () => {
    if (editingId && editForm) {
      const original = contacts.find(c => c.id === editingId);
      if (original) {
        onUpdateContact({ ...original, ...editForm });
      }
      setEditingId(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header & Filter */}
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-800">Contact List ({filteredContacts.length})</h2>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search name or phone..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-medium">
            <tr>
              <th className="px-6 py-3">Name & Company</th>
              <th className="px-6 py-3">Phone</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Notes</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredContacts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  No contacts found. Upload an image to get started.
                </td>
              </tr>
            ) : (
              filteredContacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    {editingId === contact.id ? (
                      <div className="space-y-2">
                        <input 
                          className="w-full p-1 border rounded"
                          value={editForm.name || ''} 
                          onChange={e => setEditForm({...editForm, name: e.target.value})} 
                          placeholder="Name"
                        />
                        <input 
                          className="w-full p-1 border rounded text-xs"
                          value={editForm.company || ''} 
                          onChange={e => setEditForm({...editForm, company: e.target.value})} 
                          placeholder="Company"
                        />
                      </div>
                    ) : (
                      <div>
                        <div className="font-semibold text-slate-800">{contact.name}</div>
                        {contact.company && <div className="text-xs text-slate-500">{contact.company}</div>}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-700">
                     {editingId === contact.id ? (
                        <input 
                          className="w-full p-1 border rounded"
                          value={editForm.phone || ''} 
                          onChange={e => setEditForm({...editForm, phone: e.target.value})} 
                        />
                     ) : (
                       <a href={`tel:${contact.phone}`} className="hover:text-blue-600 flex items-center gap-2">
                         {contact.phone}
                       </a>
                     )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative group">
                       <StatusBadge status={contact.status} />
                       {/* Hover Dropdown for quick status change */}
                       <div className="absolute left-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-slate-100 hidden group-hover:block z-10">
                         {Object.values(CallStatus).map((s) => (
                           <button
                            key={s}
                            onClick={() => handleStatusChange(contact, s)}
                            className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 flex items-center"
                           >
                             <div className={`w-2 h-2 rounded-full mr-2 ${
                               s === CallStatus.INTERESTED ? 'bg-emerald-500' : 
                               s === CallStatus.CLOSED ? 'bg-violet-500' : 'bg-slate-300'
                             }`} />
                             {s.replace('_', ' ')}
                           </button>
                         ))}
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-xs truncate">
                    {editingId === contact.id ? (
                        <textarea 
                          className="w-full p-1 border rounded"
                          value={editForm.notes || ''} 
                          onChange={e => setEditForm({...editForm, notes: e.target.value})} 
                        />
                     ) : (
                      <span title={contact.notes}>{contact.notes}</span>
                     )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {editingId === contact.id ? (
                      <button onClick={saveEdit} className="text-green-600 hover:text-green-800 text-sm font-medium">Save</button>
                    ) : (
                      <button onClick={() => startEdit(contact)} className="text-slate-400 hover:text-blue-600 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => onDeleteContact(contact.id)} className="text-slate-400 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};