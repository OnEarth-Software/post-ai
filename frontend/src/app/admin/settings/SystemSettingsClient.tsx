"use client";

import { useState } from 'react';
import { Save } from 'lucide-react';

export default function SystemSettingsClient({ initialConfigs }: { initialConfigs: any[] }) {
    const [configs, setConfigs] = useState<any[]>(initialConfigs || []);

    // State for a new setting
    const [newKey, setNewKey] = useState("");
    const [newValue, setNewValue] = useState("");
    const [newDesc, setNewDesc] = useState("");

    const fetchConfigs = async () => {
        const token = localStorage.getItem('token');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        try {
            const res = await fetch(`${apiUrl}/admin/configs`, {
                headers: { 'Authorization': `Bearer ${token}` },
                cache: 'no-store'
            });
            if (res.ok) {
                const data = await res.json();
                setConfigs(data);
            }
        } catch (error) {
            console.error("Error fetching configs:", error);
        }
    };

    const handleUpdate = async (key: string, value: string, description: string) => {
        const token = localStorage.getItem('token');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        try {
            const res = await fetch(`${apiUrl}/admin/configs`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ key, value, description })
            });
            if (res.ok) {
                alert("Ayar başarıyla güncellendi!");
                fetchConfigs();
            } else {
                alert("Güncelleme başarısız oldu.");
            }
        } catch (error) {
            alert("Sunucuya bağlanılamadı.");
        }
    };

    const handleAddNew = () => {
        if (!newKey || !newValue) {
            alert("Lütfen Key ve Value alanlarını doldurun.");
            return;
        }
        handleUpdate(newKey, newValue, newDesc);
        setNewKey("");
        setNewValue("");
        setNewDesc("");
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Sistem Ayarları & Fiyatlandırma</h1>
            
            {/* ADD NEW SETTING CARD */}
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Yeni Ayar Ekle</h2>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <input 
                        type="text" 
                        placeholder="Örn: COST_PRODUCT_UPLOAD" 
                        style={{ border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '4px', flex: 1, textTransform: 'uppercase' }}
                        value={newKey} 
                        onChange={e => setNewKey(e.target.value.toUpperCase())} 
                    />
                    <input 
                        type="text" 
                        placeholder="Değer (Örn: 20)" 
                        style={{ border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '4px', flex: 1 }}
                        value={newValue} 
                        onChange={e => setNewValue(e.target.value)} 
                    />
                    <input 
                        type="text" 
                        placeholder="Açıklama" 
                        style={{ border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '4px', flex: 1 }}
                        value={newDesc} 
                        onChange={e => setNewDesc(e.target.value)} 
                    />
                    <button 
                        onClick={handleAddNew} 
                        style={{ background: '#059669', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', border: 'none' }}
                    >
                        <Save size={16} /> Ekle
                    </button>
                </div>
            </div>

            {/* EXISTING SETTINGS TABLE */}
            <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <tr>
                            <th style={{ padding: '1rem', fontWeight: 600, color: '#475569' }}>Ayar Anahtarı (Key)</th>
                            <th style={{ padding: '1rem', fontWeight: 600, color: '#475569' }}>Değer (Value)</th>
                            <th style={{ padding: '1rem', fontWeight: 600, color: '#475569' }}>Açıklama</th>
                            <th style={{ padding: '1rem', fontWeight: 600, color: '#475569' }}>İşlem</th>
                        </tr>
                    </thead>
                    <tbody>
                        {configs.map((cfg) => (
                            <tr key={cfg.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.875rem', fontWeight: 600 }}>{cfg.key}</td>
                                <td style={{ padding: '1rem' }}>
                                    <input 
                                        type="text" 
                                        defaultValue={cfg.value} 
                                        style={{ border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '4px', width: '100%' }}
                                        id={`val-${cfg.key}`}
                                    />
                                </td>
                                <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#64748b' }}>
                                    <input 
                                        type="text" 
                                        defaultValue={cfg.description} 
                                        style={{ border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '4px', width: '100%' }}
                                        id={`desc-${cfg.key}`}
                                    />
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <button 
                                        onClick={() => {
                                            const val = (document.getElementById(`val-${cfg.key}`) as HTMLInputElement).value;
                                            const desc = (document.getElementById(`desc-${cfg.key}`) as HTMLInputElement).value;
                                            handleUpdate(cfg.key, val, desc);
                                        }} 
                                        style={{ background: '#eff6ff', color: '#2563eb', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', border: 'none' }}
                                    >
                                        Güncelle
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {configs.length === 0 && (
                            <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Henüz hiç sistem ayarı eklenmemiş. Yukarıdan ilk ayarınızı ekleyin.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
