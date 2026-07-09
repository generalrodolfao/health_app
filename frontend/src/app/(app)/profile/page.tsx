'use client';

import { useState } from 'react';
import { Card, Button, PageHeader, Spinner } from '@/components/ui';

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: 'Maria Silva',
    email: 'maria@email.com',
    phone: '(11) 99999-8888',
    emergencyName: 'João Silva',
    emergencyPhone: '(11) 97777-6666',
    healthPlan: 'Unimed',
    healthPlanNumber: '123456789',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const inputClass = 'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500';

  return (
    <>
      <PageHeader title="Meu Perfil" subtitle="Gerencie suas informações pessoais e de saúde" />

      {saved && (
        <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          ✓ Alterações salvas com sucesso!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card title="Informações Pessoais">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome</label>
              <input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" value={profile.email} disabled className={`${inputClass} bg-gray-50 text-gray-500`} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Telefone</label>
              <input type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="(11) 99999-8888" className={inputClass} />
            </div>
          </div>
        </Card>

        <Card title="Contato de Emergência">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome</label>
              <input type="text" value={profile.emergencyName} onChange={(e) => setProfile({ ...profile, emergencyName: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Telefone</label>
              <input type="tel" value={profile.emergencyPhone} onChange={(e) => setProfile({ ...profile, emergencyPhone: e.target.value })} placeholder="(11) 97777-6666" className={inputClass} />
            </div>
          </div>
        </Card>

        <Card title="Plano de Saúde">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Operadora</label>
              <input type="text" value={profile.healthPlan} onChange={(e) => setProfile({ ...profile, healthPlan: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Número da Carteira</label>
              <input type="text" value={profile.healthPlanNumber} onChange={(e) => setProfile({ ...profile, healthPlanNumber: e.target.value })} className={inputClass} />
            </div>
          </div>
        </Card>

        <Button type="submit" size="lg" fullWidth disabled={saving}>
          {saving ? <Spinner className="h-5 w-5" /> : 'Salvar Alterações'}
        </Button>
      </form>
    </>
  );
}
