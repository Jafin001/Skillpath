import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Plus, Trash2, Search, Link as LinkIcon, FileText, Image as ImageIcon, Eye, X, Upload, Check } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Certificate } from '../store/useStore';
import { cn } from '../lib/utils';

export function Certificates() {
  const { certificates, skills, addCertificate, deleteCertificate } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  
  // File upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; type: 'image' | 'pdf'; dataUrl: string } | null>(null);
  const [form, setForm] = useState({
    title: '',
    issuer: '',
    issueDate: new Date().toISOString().slice(0, 10),
    skillId: '',
    fileType: 'image' as Certificate['fileType'],
    fileUrl: '',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.type.includes('pdf') ? 'pdf' : 'image';
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setUploadedFile({
          name: file.name,
          type: fileType as 'image' | 'pdf',
          dataUrl: reader.result as string,
        });
        setForm(prev => ({
          ...prev,
          fileType: fileType as Certificate['fileType'],
          fileUrl: reader.result as string,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.issuer.trim() || !form.fileUrl.trim()) return;

    const associatedSkill = skills.find(s => s.id === form.skillId);
    
    addCertificate({
      title: form.title.trim(),
      issuer: form.issuer.trim(),
      issueDate: form.issueDate,
      skillId: form.skillId || undefined,
      skillName: associatedSkill?.name || undefined,
      fileType: form.fileType,
      fileUrl: form.fileUrl,
    });

    // Reset Form
    setForm({
      title: '',
      issuer: '',
      issueDate: new Date().toISOString().slice(0, 10),
      skillId: '',
      fileType: 'image',
      fileUrl: '',
    });
    setUploadedFile(null);
    setIsOpen(false);
  };

  const filtered = certificates.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.issuer.toLowerCase().includes(search.toLowerCase()) ||
    c.skillName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-10">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Award className="text-primary animate-pulse" size={32} />
            Certificates & Credentials
          </h1>
          <p className="text-textMuted font-medium">Verify your hard work and showcase your achievements.</p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-primary hover:bg-primary/95 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:scale-105"
        >
          <Plus size={18} />
          Add Credential
        </button>
      </header>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={18} />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search credentials..."
          className="w-full bg-surface border border-border rounded-xl py-2.5 pl-10 pr-4 text-text focus:outline-none focus:border-primary/50 transition-colors"
        />
      </div>

      {/* Credentials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filtered.map((cert) => (
            <motion.div
              key={cert.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass rounded-2xl overflow-hidden group border border-border/50 hover:border-primary/30 transition-all flex flex-col h-full cursor-default"
            >
              {/* Media Preview Box */}
              <div className="h-44 bg-surfaceHighlight/30 relative flex items-center justify-center overflow-hidden border-b border-border/50">
                {cert.fileType === 'image' ? (
                  <img src={cert.fileUrl} alt={cert.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : cert.fileType === 'pdf' ? (
                  <div className="flex flex-col items-center gap-2 text-primary">
                    <FileText size={48} className="animate-bounce" style={{ animationDuration: '3s' }} />
                    <span className="text-xs font-semibold uppercase tracking-wider text-textMuted">PDF Document</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-blue-400">
                    <LinkIcon size={48} />
                    <span className="text-xs font-semibold uppercase tracking-wider text-textMuted">External Link</span>
                  </div>
                )}
                {/* Actions Hover Layer */}
                <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 z-10">
                  <button
                    onClick={() => setSelectedCert(cert)}
                    className="p-3 rounded-xl bg-primary text-white hover:bg-primary/95 transition-transform hover:scale-110 flex items-center gap-2 font-bold text-sm"
                  >
                    <Eye size={16} />
                    View Details
                  </button>
                  <button
                    onClick={() => deleteCertificate(cert.id)}
                    className="p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 transition-transform hover:scale-110"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Text Info */}
              <div className="p-5 flex-1 flex flex-col gap-3">
                <div>
                  <h3 className="font-bold text-lg leading-tight line-clamp-1">{cert.title}</h3>
                  <p className="text-sm text-textMuted font-medium">{cert.issuer}</p>
                </div>

                <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/40 text-xs">
                  <span className="text-textMuted">
                    Issued: {new Date(cert.issueDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                  {cert.skillName && (
                    <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-semibold">
                      {cert.skillName}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📜</div>
          <h3 className="text-xl font-semibold mb-2">No certificates found</h3>
          <p className="text-textMuted">Link or upload your credentials to show off your capabilities.</p>
        </div>
      )}

      {/* ── Add Credential Modal ── */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.95 }}
              className="relative w-full max-w-lg bg-surface border border-border rounded-3xl shadow-2xl p-6 overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Add Certificate / Credential</h2>
                <button onClick={() => setIsOpen(false)} className="text-textMuted hover:text-text">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-textMuted mb-1.5">Credential Name</label>
                  <input
                    required
                    type="text"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-text focus:outline-none focus:border-primary/50"
                    placeholder="e.g. Meta Front-End Developer Professional Certificate"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-textMuted mb-1.5">Issuer / Organization</label>
                    <input
                      required
                      type="text"
                      value={form.issuer}
                      onChange={e => setForm({ ...form, issuer: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-text focus:outline-none focus:border-primary/50"
                      placeholder="e.g. Coursera, Udemy, Google"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-textMuted mb-1.5">Issue Date</label>
                    <input
                      required
                      type="date"
                      value={form.issueDate}
                      onChange={e => setForm({ ...form, issueDate: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-text focus:outline-none focus:border-primary/50"
                    />
                  </div>
                </div>

                {/* Associate Skill Selector */}
                <div>
                  <label className="block text-sm font-medium text-textMuted mb-1.5">Associated Skill (Optional)</label>
                  <select
                    value={form.skillId}
                    onChange={e => setForm({ ...form, skillId: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-text focus:outline-none focus:border-primary/50"
                  >
                    <option value="">None / General</option>
                    {skills.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                {/* Selection of File Type or Link */}
                <div>
                  <label className="block text-sm font-medium text-textMuted mb-1.5">Document Source Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { type: 'image', label: 'Image File', icon: ImageIcon },
                      { type: 'pdf', label: 'PDF Doc', icon: FileText },
                      { type: 'link', label: 'Web Link', icon: LinkIcon },
                    ].map(item => (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => {
                          setForm(prev => ({
                            ...prev,
                            fileType: item.type as Certificate['fileType'],
                            fileUrl: item.type === 'link' ? '' : uploadedFile?.dataUrl || '',
                          }));
                        }}
                        className={cn(
                          "py-3 rounded-xl border flex flex-col items-center gap-1.5 text-[10px] sm:text-xs transition-all font-semibold",
                          form.fileType === item.type
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-textMuted hover:border-primary/40"
                        )}
                      >
                        <item.icon size={18} />
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* File Upload Box or Link Input Field */}
                {form.fileType === 'link' ? (
                  <div>
                    <label className="block text-sm font-medium text-textMuted mb-1.5">Credential Web URL</label>
                    <input
                      required
                      type="url"
                      value={form.fileUrl}
                      onChange={e => setForm({ ...form, fileUrl: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-text focus:outline-none focus:border-primary/50"
                      placeholder="https://example.com/certificates/your-id"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-textMuted mb-1.5">Upload Certificate Document</label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept={form.fileType === 'pdf' ? '.pdf' : 'image/*'}
                      className="hidden"
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-border/80 hover:border-primary/50 rounded-2xl p-6 text-center cursor-pointer transition-all bg-background/40 hover:bg-background/80"
                    >
                      {uploadedFile && form.fileUrl ? (
                        <div className="flex items-center justify-center gap-3 text-green-400">
                          <Check size={24} />
                          <div className="text-left">
                            <p className="font-semibold text-sm line-clamp-1">{uploadedFile.name}</p>
                            <p className="text-xs text-textMuted">Click to replace file</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="mx-auto text-textMuted" size={32} />
                          <p className="font-medium text-sm">Click to select files from device</p>
                          <p className="text-xs text-textMuted">Supports JPEG, PNG, or PDF formats</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Submit / Actions */}
                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-textMuted hover:text-text hover:bg-surfaceHighlight transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!form.fileUrl}
                    className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                  >
                    Add Credential
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Dynamic Lightbox Viewer ── */}
      <AnimatePresence>
        {selectedCert && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCert(null)}
              className="absolute inset-0 bg-background/95 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl bg-surface border border-border rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[85vh]"
            >
              {/* Lightbox Header */}
              <div className="p-5 flex items-center justify-between border-b border-border/50">
                <div>
                  <h2 className="text-xl font-bold">{selectedCert.title}</h2>
                  <p className="text-xs text-textMuted font-medium">{selectedCert.issuer}</p>
                </div>
                <button
                  onClick={() => setSelectedCert(null)}
                  className="p-2 rounded-xl bg-surfaceHighlight hover:bg-surfaceHighlight/80 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Viewport Content */}
              <div className="flex-1 overflow-auto bg-background/50 p-6 flex items-center justify-center min-h-[400px]">
                {selectedCert.fileType === 'image' ? (
                  <img
                    src={selectedCert.fileUrl}
                    alt={selectedCert.title}
                    className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-md border border-border"
                  />
                ) : selectedCert.fileType === 'pdf' ? (
                  <iframe
                    src={selectedCert.fileUrl}
                    title={selectedCert.title}
                    className="w-full h-[60vh] rounded-lg shadow-md border border-border"
                  />
                ) : (
                  <div className="text-center space-y-4 max-w-sm p-6">
                    <LinkIcon className="mx-auto text-primary" size={64} />
                    <h3 className="font-bold text-lg">Web Credential</h3>
                    <p className="text-sm text-textMuted">This credential is stored on an external website.</p>
                    <a
                      href={selectedCert.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                    >
                      Visit Credential Link
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
