import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { api } from '../api';

export default function Profil() {
  const { user, setUser, logout } = useAuth();
  const [editing, setEditing]     = useState(false);
  const [form,    setForm]        = useState({});
  const [km,      setKm]          = useState({ total_km: 0, jours: [] });
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);

  useEffect(() => {
    api.getProfil().then(data => { if (data) setForm(data); });
    api.getKm({}).then(data => { if (data) setKm(data); }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setSuccess(false);
    try {
      await api.updateProfil(form);
      setUser({ ...user, ...form });
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const initials = ((form.prenom?.[0] || '') + (form.nom?.[0] || '')).toUpperCase();

  return (
    <div>
      {/* En-tête profil */}
      <div className="profil-header">
        <div className="profil-avatar">{initials || '?'}</div>
        <div className="profil-name">{form.prenom} {form.nom}</div>
        <div className="profil-email">{form.email}</div>
      </div>

      {success && (
        <div style={{ background: '#E4F5EF', color: '#10674E', padding: '9px 14px', borderRadius: 9, fontSize: 12.5, marginBottom: 12, textAlign: 'center', border: '1px solid #b6e5d4' }}>
          ✓ Profil mis à jour
        </div>
      )}

      {/* ===== INFORMATIONS ===== */}
      <div className="card">
        <div className="card-row mb-2">
          <span style={{ fontSize: 13, fontWeight: 600, color: '#16202E' }}>Informations personnelles</span>
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => editing ? setEditing(false) : setEditing(true)}
          >
            {editing ? 'Annuler' : '✎ Modifier'}
          </button>
        </div>

        {editing ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="form-group"><label>Nom</label><input value={form.nom || ''} onChange={e => setForm({...form, nom: e.target.value})} /></div>
              <div className="form-group"><label>Prénom</label><input value={form.prenom || ''} onChange={e => setForm({...form, prenom: e.target.value})} /></div>
            </div>
            <div className="form-group"><label>Téléphone</label><input type="tel" value={form.telephone || ''} onChange={e => setForm({...form, telephone: e.target.value})} /></div>
            <div className="form-group"><label>Adresse</label><input value={form.adresse || ''} onChange={e => setForm({...form, adresse: e.target.value})} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
              <div className="form-group"><label>Ville</label><input value={form.ville || ''} onChange={e => setForm({...form, ville: e.target.value})} /></div>
              <div className="form-group"><label>Code postal</label><input value={form.code_postal || ''} onChange={e => setForm({...form, code_postal: e.target.value})} /></div>
            </div>
            <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
              {loading ? 'Enregistrement…' : 'Sauvegarder'}
            </button>
          </>
        ) : (
          <>
            <div className="info-row"><span className="info-label">Téléphone</span><span className="info-value">{form.telephone || '—'}</span></div>
            <div className="info-row"><span className="info-label">Adresse</span><span className="info-value">{form.adresse ? `${form.adresse}, ${form.ville || ''} ${form.code_postal || ''}` : '—'}</span></div>
            <div className="info-row"><span className="info-label">E-mail</span><span className="info-value">{form.email}</span></div>
          </>
        )}
      </div>

      {/* ===== KILOMÉTRAGE ===== */}
      <div className="card">
        <div style={{ fontSize: 13, fontWeight: 600, color: '#16202E', marginBottom: 12 }}>Kilométrage du mois</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, marginBottom: 8 }}>
          <span style={{ fontSize: 32, fontWeight: 700, color: '#0C2D4E', lineHeight: 1 }}>
            {km.total_km || 0}
          </span>
          <span style={{ fontSize: 14, color: '#6B7A8D', marginBottom: 4 }}>km</span>
        </div>

        {km.jours && km.jours.length > 0 ? (
          <div>
            {km.jours.slice(0, 5).map((j, i) => (
              <div key={i} className="info-row">
                <span className="info-label">{j.date ? new Date(j.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }) : '—'}</span>
                <span className="info-value" style={{ fontWeight: 500 }}>{j.km} km</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: 12, color: '#98A4B3', textAlign: 'center', padding: '8px 0' }}>
            Aucun kilométrage enregistré ce mois
          </div>
        )}
      </div>

      {/* ===== VERSION ===== */}
      <div className="card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 11.5, color: '#98A4B3' }}>Santé + · v{process.env.REACT_APP_VERSION || '1.0.0'}</div>
        <div style={{ fontSize: 10.5, color: '#C8D0DA', marginTop: 3 }}>Infirmier(e) libéral(e)</div>
      </div>

      {/* ===== DÉCONNEXION ===== */}
      <button
        className="btn btn-danger"
        onClick={() => { if (window.confirm('Se déconnecter ?')) logout(); }}
        style={{ marginTop: 4 }}
      >
        Se déconnecter
      </button>
    </div>
  );
}
