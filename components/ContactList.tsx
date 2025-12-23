
import React, { useState } from 'react';
import { Contact, CallStatus } from '../types';
import { Phone, CheckCircle, XCircle, Clock, AlertCircle, Trash2, Edit2, Search, MoreVertical, Save, X } from 'lucide-react';

interface ContactListProps {
  contacts: Contact[];
  onUpdateContact: (contact: Contact) => void;
  onDeleteContact: (id: string) => void;
}

const StatusBadge: React.FC<{ status: CallStatus }> = ({ status }) => {
  const styles = {
    [CallStatus.PENDING]: "bg-slate-100/80 text-slate-600 border-slate-200",
    [CallStatus.CALLED]: "bg-blue-100/80 text-blue-700 border-blue-200",
    [CallStatus.NO_ANSWER]: "bg-amber-100/80 text-amber-700 border-amber-200",
    [CallStatus.INTERESTED]: "bg-emerald-100/80 text-emerald-700 border-emerald-200",
    [CallStatus.NOT_INTERESTED]: "bg-red-100/80 text-red-700 border-red-200",
    [CallStatus.CLOSED]: "bg-violet-100/80 text-violet-700 border-violet-200",
  };

  const icons = {
    [CallStatus.PENDING]: <Clock className="w-3 h-3 mr-1.5" />,
    [CallStatus.CALLED]: <Phone className="w-3 h-3 mr-1.5" />,
    [CallStatus.NO_ANSWER]: <AlertCircle className="w-3 h-3 mr-1.5" />,
    [CallStatus.INTERESTED]: <CheckCircle className="w-3 h-3 mr-1.5" />,
    [CallStatus.NOT_INTERESTED]: <XCircle className="w-3 h-3 mr-1.5" />,
    [CallStatus.CLOSED]: <CheckCircle className="w-3 h-3 mr-1.5" />,
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm transition-all duration-300 shadow-sm ${styles[status]}`}>
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

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
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
    <div className="glass-card rounded-2xl overflow-hidden border border-white/40 shadow-xl transition-all duration-500">
      {/* Header & Filter */}
      <div className="p-6 border-b border-slate-100/50 flex flex-col md:flex-row gap-5 justify-between items-center bg-white/40 backdrop-blur-md">
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">
          Your Leads <span className="text-sm font-medium text-slate-500 ml-1">({filteredContacts.length})</span>
        </h2>
        
        <div className="relative w-full md:w-72 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search leads..."
            className="block w-full pl-10 pr-4 py-2.5 border-none rounded-xl bg-slate-100/50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white transition-all duration-300"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50/50 text-slate-700 font-semibold uppercase tracking-wider text-xs">
            <tr>
              <th className="px-6 py-4">Contact Details</th>
              <th className="px-6 py-4">Phone</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Notes</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/50 bg-white/30">
            {filteredContacts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="bg-slate-100 p-4 rounded-full mb-4">
                      <Search className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500 font-medium">No contacts found</p>
                    <p className="text-slate-400 text-sm">Try adjusting your search or upload more images.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredContacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-white/60 transition-colors duration-200 group">
                  <td className="px-6 py-4 align-top">
                    {editingId === contact.id ? (
                      <div className="space-y-3 animate-fade-in-up">
                        <input 
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm font-semibold"
                          value={editForm.name || ''} 
                          onChange={e => setEditForm({...editForm, name: e.target.value})} 
                          placeholder="Name"
                          autoFocus
                        />
                        <input 
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs"
                          value={editForm.company || ''} 
                          onChange={e => setEditForm({...editForm, company: e.target.value})} 
                          placeholder="Company"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20 mr-4">
                          {contact.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-base">{contact.name}</div>
                          {contact.company && <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mt-0.5">{contact.company}</div>}
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 align-top pt-5">
                     {editingId === contact.id ? (
                        <input 
                          className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-mono text-sm"
                          value={editForm.phone || ''} 
                          onChange={e => setEditForm({...editForm, phone: e.target.value})} 
                        />
                     ) : (
                       <a 
                        href={`tel:${contact.phone}`} 
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-blue-50 text-slate-700 hover:text-blue-700 transition-all font-mono font-medium border border-transparent hover:border-blue-100"
                       >
                         <Phone className="w-4 h-4" />
                         {contact.phone}
                       </a>
                     )}
                  </td>
                  <td className="px-6 py-4 align-top pt-5">
                    <div className="relative group/status w-fit">
                       <button className="focus:outline-none">
                         <StatusBadge status={contact.status} />
                       </button>
                       {/* Dropdown */}
                       <div className="absolute left-0 top-full mt-2 w-48 bg-white/90 backdrop-blur-xl rounded-xl shadow-2xl border border-slate-100 hidden group-hover/status:block z-20 animate-fade-in-up p-1">
                         <div className="text-xs font-semibold text-slate-400 px-3 py-2 uppercase tracking-wider">Update Status</div>
                         {Object.values(CallStatus).map((s) => (
                           <button
                            key={s}
                            onClick={() => handleStatusChange(contact, s)}
                            className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 flex items-center transition-colors"
                           >
                             <div className={`w-2 h-2 rounded-full mr-3 ${
                               s === CallStatus.INTERESTED ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 
                               s === CallStatus.CLOSED ? 'bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]' : 
                               s === 'PENDING' ? 'bg-slate-300' : 'bg-blue-400'
                             }`} />
                             {s.replace('_', ' ')}
                           </button>
                         ))}
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top pt-5 max-w-xs">
                    {editingId === contact.id ? (
                        <textarea 
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm min-h-[80px]"
                          value={editForm.notes || ''} 
                          onChange={e => setEditForm({...editForm, notes: e.target.value})} 
                          placeholder="Add notes..."
                        />
                     ) : (
                      <p className="text-sm text-slate-500 line-clamp-2" title={contact.notes}>
                        {contact.notes || <span className="text-slate-300 italic">No notes</span>}
                      </p>
                     )}
                  </td>
                  <td className="px-6 py-4 align-top pt-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {editingId === contact.id ? (
                        <>
                          <button onClick={saveEdit} className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors" title="Save">
                            <Save className="w-4 h-4" />
                          </button>
                          <button onClick={cancelEdit} className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 transition-colors" title="Cancel">
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(contact)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => onDeleteContact(contact.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
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