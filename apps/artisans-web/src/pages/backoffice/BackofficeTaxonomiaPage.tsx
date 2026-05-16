import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getPendingTaxonomies } from '@/services/taxonomy.actions';
import { TaxonomyResumenTab } from '@/components/backoffice/taxonomy/TaxonomyResumenTab';
import { TaxonomyCrudTab } from '@/components/backoffice/taxonomy/TaxonomyCrudTab';
import { TaxonomyTecnicasTab } from '@/components/backoffice/taxonomy/TaxonomyTecnicasTab';
import { TaxonomyCategoriasTab } from '@/components/backoffice/taxonomy/TaxonomyCategoriasTab';
import { TaxonomyBadgesTab } from '@/components/backoffice/taxonomy/TaxonomyBadgesTab';
import { TaxonomyAliasTab } from '@/components/backoffice/taxonomy/TaxonomyAliasTab';

const GREEN = '#15803d';
const NAVY = '#151b2d';
const CREAM = '#f9f7f2';

const TABS = [
  { value: 'resumen', label: 'Resumen' },
  { value: 'categorias', label: 'Categorías' },
  { value: 'oficios', label: 'Oficios' },
  { value: 'tecnicas', label: 'Técnicas' },
  { value: 'materiales', label: 'Materiales' },
  { value: 'estilos', label: 'Estilos' },
  { value: 'herramientas', label: 'Herramientas' },
  { value: 'badges', label: 'Badges' },
  { value: 'curatorial', label: 'Cat. Curatoriales' },
  { value: 'aliases', label: 'Aliases' },
] as const;

export default function BackofficeTaxonomiaPage() {
  const [activeTab, setActiveTab] = useState<string>('resumen');
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    getPendingTaxonomies()
      .then((data) => {
        const total = Object.values(data).reduce((acc, arr) => acc + arr.length, 0);
        setPendingCount(total);
      })
      .catch(() => {});
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: CREAM,
        backgroundImage: 'radial-gradient(ellipse at 10% 20%, rgba(21,128,61,0.08) 0%, transparent 55%), radial-gradient(ellipse at 85% 80%, rgba(21,128,61,0.05) 0%, transparent 50%)',
        padding: '28px 24px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: `${GREEN}18`,
            border: `1.5px solid ${GREEN}33`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Tag size={22} color={GREEN} />
          </div>
          <div>
            <h1 style={{
              margin: 0,
              fontFamily: "'League Spartan', Arial, sans-serif",
              fontWeight: 800,
              fontSize: 'clamp(20px, 3vw, 28px)',
              color: NAVY,
              letterSpacing: -0.5,
            }}>
              Gestión de Taxonomías
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280', marginTop: 2 }}>
              Administra todos los términos del catálogo
            </p>
          </div>
        </div>
        <Link to="/backoffice/taxonomia/moderacion" style={{ textDecoration: 'none' }}>
          <Button
            variant="outline"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              borderColor: pendingCount > 0 ? '#ec6d13' : '#d1d5db',
              color: pendingCount > 0 ? '#c2410c' : '#374151',
              background: pendingCount > 0 ? 'rgba(236,109,19,0.06)' : 'white',
              fontFamily: "'League Spartan', sans-serif",
              fontWeight: 600,
            }}
          >
            <ShieldCheck size={16} />
            Moderación
            {pendingCount > 0 && (
              <span style={{
                background: '#ec6d13',
                color: '#fff',
                borderRadius: 20,
                padding: '1px 7px',
                fontSize: 11,
                fontWeight: 700,
                marginLeft: 2,
              }}>
                {pendingCount}
              </span>
            )}
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
          <TabsList
            style={{
              background: 'rgba(255,255,255,0.75)',
              border: '1px solid rgba(21,128,61,0.15)',
              borderRadius: 12,
              padding: 4,
              height: 'auto',
              flexWrap: 'nowrap',
              display: 'inline-flex',
              minWidth: 'max-content',
              marginBottom: 20,
            }}
          >
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                style={{
                  fontFamily: "'League Spartan', sans-serif",
                  fontWeight: 600,
                  fontSize: 13,
                  borderRadius: 8,
                  padding: '6px 14px',
                  whiteSpace: 'nowrap',
                  color: activeTab === tab.value ? '#fff' : '#374151',
                  background: activeTab === tab.value ? GREEN : 'transparent',
                  transition: 'all 0.15s',
                }}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="resumen"><TaxonomyResumenTab /></TabsContent>
        <TabsContent value="categorias"><TaxonomyCategoriasTab /></TabsContent>
        <TabsContent value="oficios"><TaxonomyCrudTab type="crafts" label="Oficios" /></TabsContent>
        <TabsContent value="tecnicas"><TaxonomyTecnicasTab /></TabsContent>
        <TabsContent value="materiales"><TaxonomyCrudTab type="materials" label="Materiales" /></TabsContent>
        <TabsContent value="estilos"><TaxonomyCrudTab type="styles" label="Estilos" /></TabsContent>
        <TabsContent value="herramientas"><TaxonomyCrudTab type="herramientas" label="Herramientas" /></TabsContent>
        <TabsContent value="badges"><TaxonomyBadgesTab /></TabsContent>
        <TabsContent value="curatorial"><TaxonomyCrudTab type="curatorial" label="Categorías Curatoriales" /></TabsContent>
        <TabsContent value="aliases"><TaxonomyAliasTab /></TabsContent>
      </Tabs>
    </div>
  );
}
