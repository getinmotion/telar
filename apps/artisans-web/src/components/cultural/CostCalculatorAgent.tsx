
import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, ArrowLeft, FileText, Printer, Download } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { mapToLegacyLanguage } from '@/utils/languageMapper';

type MaterialCost = {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

type LaborCost = {
  description: string;
  hours: number;
  hourlyRate: number;
  total: number;
};

export const CostCalculatorAgent = () => {
  const { language } = useLanguage();
  const compatibleLanguage = mapToLegacyLanguage(language);
  const { toast } = useToast();
  const [step, setStep] = useState<'info' | 'materials' | 'labor' | 'overhead' | 'results'>('info');
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [materials, setMaterials] = useState<MaterialCost[]>([{ name: '', quantity: 0, unitPrice: 0, total: 0 }]);
  const [labor, setLabor] = useState<LaborCost[]>([{ description: '', hours: 0, hourlyRate: 0, total: 0 }]);
  const [overhead, setOverhead] = useState(0);
  const [suggestedPrice, setSuggestedPrice] = useState(0);
  
  const t = {
    en: {
      title: "Cost & Profitability Calculator",
      description: "Calculate the true cost and profitability of your creative work",
      steps: {
        info: "Product Information",
        materials: "Material Costs",
        labor: "Labor Costs",
        overhead: "Overhead Costs",
        results: "Results & Pricing"
      },
      productName: "Product Name",
      productDescription: "Product Description",
      materialName: "Material Name",
      quantity: "Quantity",
      unitPrice: "Unit Price ($)",
      total: "Total",
      laborDescription: "Task Description",
      hours: "Hours",
      hourlyRate: "Hourly Rate ($)",
      overheadCosts: "Overhead Costs ($)",
      overheadDescription: "Include costs like utilities, rent, tools depreciation, etc.",
      results: {
        totalMaterials: "Total Material Costs",
        totalLabor: "Total Labor Costs",
        totalOverhead: "Total Overhead",
        totalCost: "Total Production Cost",
        suggestedPrice: "Suggested Retail Price",
        profit: "Estimated Profit",
        profitMargin: "Profit Margin"
      },
      buttons: {
        addMaterial: "Add Material",
        addLabor: "Add Labor",
        next: "Next",
        back: "Back",
        calculate: "Calculate",
        print: "Print",
        download: "Download PDF",
        finish: "Finish"
      }
    },
    es: {
      title: "Calculadora de Costos y Rentabilidad",
      description: "Calcula el costo real y la rentabilidad de tu trabajo creativo",
      steps: {
        info: "Información del Producto",
        materials: "Costos de Materiales",
        labor: "Costos de Mano de Obra",
        overhead: "Costos Indirectos",
        results: "Resultados y Precios"
      },
      productName: "Nombre del Producto",
      productDescription: "Descripción del Producto",
      materialName: "Nombre del Material",
      quantity: "Cantidad",
      unitPrice: "Precio Unitario ($)",
      total: "Total",
      laborDescription: "Descripción de Tarea",
      hours: "Horas",
      hourlyRate: "Tarifa por Hora ($)",
      overheadCosts: "Costos Indirectos ($)",
      overheadDescription: "Incluye costos como servicios públicos, alquiler, depreciación de herramientas, etc.",
      results: {
        totalMaterials: "Costos Totales de Materiales",
        totalLabor: "Costos Totales de Mano de Obra",
        totalOverhead: "Costos Indirectos Totales",
        totalCost: "Costo Total de Producción",
        suggestedPrice: "Precio Minorista Sugerido",
        profit: "Ganancia Estimada",
        profitMargin: "Margen de Ganancia"
      },
      buttons: {
        addMaterial: "Añadir Material",
        addLabor: "Añadir Mano de Obra",
        next: "Siguiente",
        back: "Atrás",
        calculate: "Calcular",
        print: "Imprimir",
        download: "Descargar PDF",
        finish: "Finalizar"
      }
    }
  };

  const updateMaterialTotal = (index: number, material: MaterialCost) => {
    const newMaterials = [...materials];
    newMaterials[index] = {
      ...material,
      total: material.quantity * material.unitPrice
    };
    setMaterials(newMaterials);
  };

  const updateLaborTotal = (index: number, laborItem: LaborCost) => {
    const newLabor = [...labor];
    newLabor[index] = {
      ...laborItem,
      total: laborItem.hours * laborItem.hourlyRate
    };
    setLabor(newLabor);
  };

  const addMaterial = () => {
    setMaterials([...materials, { name: '', quantity: 0, unitPrice: 0, total: 0 }]);
  };

  const addLabor = () => {
    setLabor([...labor, { description: '', hours: 0, hourlyRate: 0, total: 0 }]);
  };

  const removeMaterial = (index: number) => {
    const newMaterials = materials.filter((_, i) => i !== index);
    setMaterials(newMaterials);
  };

  const removeLabor = (index: number) => {
    const newLabor = labor.filter((_, i) => i !== index);
    setLabor(newLabor);
  };

  const calculateResults = () => {
    const totalMaterialCost = materials.reduce((sum, item) => sum + item.total, 0);
    const totalLaborCost = labor.reduce((sum, item) => sum + item.total, 0);
    
    const totalCost = totalMaterialCost + totalLaborCost + overhead;
    // Add a 30% markup for retail price suggestion
    const suggestedRetailPrice = totalCost * 1.3;
    
    setSuggestedPrice(suggestedRetailPrice);
    
    return {
      materialCost: totalMaterialCost,
      laborCost: totalLaborCost,
      overheadCost: overhead,
      totalCost: totalCost,
      suggestedPrice: suggestedRetailPrice,
      profit: suggestedRetailPrice - totalCost,
      profitMargin: ((suggestedRetailPrice - totalCost) / suggestedRetailPrice) * 100
    };
  };

  const handleNext = () => {
    if (step === 'info') setStep('materials');
    else if (step === 'materials') setStep('labor');
    else if (step === 'labor') setStep('overhead');
    else if (step === 'overhead') {
      calculateResults();
      setStep('results');
    }
  };

  const handleBack = () => {
    if (step === 'materials') setStep('info');
    else if (step === 'labor') setStep('materials');
    else if (step === 'overhead') setStep('labor');
    else if (step === 'results') setStep('overhead');
  };

  const handlePrint = () => {
    toast({
      title: "Printing",
      description: compatibleLanguage === 'en' 
        ? "Preparing document for printing..."
        : "Preparando documento para imprimir..."
    });
    // Implement actual print logic
  };

  const handleDownload = () => {
    toast({
      title: "Download Started",
      description: compatibleLanguage === 'en' 
        ? "Your cost calculation PDF is being prepared for download."
        : "Tu PDF de cálculo de costos se está preparando para descargar."
    });
    // Implement actual download logic
  };

  const renderStepContent = () => {
    switch (step) {
      case 'info':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="productName">{t[compatibleLanguage].productName}</Label>
              <Input
                id="productName"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder={compatibleLanguage === 'en' ? "e.g., Hand-woven textile bag" : "ej., Bolsa textil tejida a mano"}
              />
            </div>
            <div>
              <Label htmlFor="productDescription">{t[compatibleLanguage].productDescription}</Label>
              <Textarea
                id="productDescription"
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                placeholder={compatibleLanguage === 'en' ? "Describe your product..." : "Describe tu producto..."}
                rows={4}
              />
            </div>
          </div>
        );
        
      case 'materials':
        return (
          <div className="space-y-4">
            {materials.map((material, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-4">
                  <Label>{index === 0 ? t[compatibleLanguage].materialName : ''}</Label>
                  <Input
                    value={material.name}
                    onChange={(e) => {
                      const newMaterials = [...materials];
                      newMaterials[index].name = e.target.value;
                      setMaterials(newMaterials);
                    }}
                  />
                </div>
                <div className="col-span-2">
                  <Label>{index === 0 ? t[compatibleLanguage].quantity : ''}</Label>
                  <Input
                    type="number"
                    min="0"
                    value={material.quantity}
                    onChange={(e) => {
                      const newMaterial = { ...material, quantity: parseFloat(e.target.value) || 0 };
                      updateMaterialTotal(index, newMaterial);
                    }}
                  />
                </div>
                <div className="col-span-2">
                  <Label>{index === 0 ? t[compatibleLanguage].unitPrice : ''}</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={material.unitPrice}
                    onChange={(e) => {
                      const newMaterial = { ...material, unitPrice: parseFloat(e.target.value) || 0 };
                      updateMaterialTotal(index, newMaterial);
                    }}
                  />
                </div>
                <div className="col-span-2">
                  <Label>{index === 0 ? t[compatibleLanguage].total : ''}</Label>
                  <Input
                    type="number"
                    value={material.total.toFixed(2)}
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <div className="col-span-2 flex justify-end">
                  {materials.length > 1 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeMaterial(index)}
                      className="text-destructive hover:text-destructive/90"
                    >
                      X
                    </Button>
                  )}
                </div>
              </div>
            ))}
            <Button variant="outline" onClick={addMaterial}>
              {t[compatibleLanguage].buttons.addMaterial}
            </Button>
          </div>
        );
        
      case 'labor':
        return (
          <div className="space-y-4">
            {labor.map((laborItem, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-6">
                  <Label>{index === 0 ? t[compatibleLanguage].laborDescription : ''}</Label>
                  <Input
                    value={laborItem.description}
                    onChange={(e) => {
                      const newLabor = [...labor];
                      newLabor[index].description = e.target.value;
                      setLabor(newLabor);
                    }}
                  />
                </div>
                <div className="col-span-2">
                  <Label>{index === 0 ? t[compatibleLanguage].hours : ''}</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    value={laborItem.hours}
                    onChange={(e) => {
                      const newLaborItem = { ...laborItem, hours: parseFloat(e.target.value) || 0 };
                      updateLaborTotal(index, newLaborItem);
                    }}
                  />
                </div>
                <div className="col-span-2">
                  <Label>{index === 0 ? t[compatibleLanguage].hourlyRate : ''}</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={laborItem.hourlyRate}
                    onChange={(e) => {
                      const newLaborItem = { ...laborItem, hourlyRate: parseFloat(e.target.value) || 0 };
                      updateLaborTotal(index, newLaborItem);
                    }}
                  />
                </div>
                <div className="col-span-2">
                  <Label>{index === 0 ? t[compatibleLanguage].total : ''}</Label>
                  <Input
                    type="number"
                    value={laborItem.total.toFixed(2)}
                    readOnly
                    className="bg-muted"
                  />
                </div>
                {labor.length > 1 && (
                  <div className="col-span-12 flex justify-end">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeLabor(index)}
                      className="text-destructive hover:text-destructive/90"
                    >
                      X
                    </Button>
                  </div>
                )}
              </div>
            ))}
            <Button variant="outline" onClick={addLabor}>
              {t[compatibleLanguage].buttons.addLabor}
            </Button>
          </div>
        );
        
      case 'overhead':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="overhead">{t[compatibleLanguage].overheadCosts}</Label>
              <Input
                id="overhead"
                type="number"
                min="0"
                step="0.01"
                value={overhead}
                onChange={(e) => setOverhead(parseFloat(e.target.value) || 0)}
              />
              <p className="text-sm text-muted-foreground mt-1">{t[compatibleLanguage].overheadDescription}</p>
            </div>
          </div>
        );
        
      case 'results':
        const results = calculateResults();
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{t[compatibleLanguage].results.totalMaterials}</p>
                <p className="text-xl font-bold">${results.materialCost.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t[compatibleLanguage].results.totalLabor}</p>
                <p className="text-xl font-bold">${results.laborCost.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t[compatibleLanguage].results.totalOverhead}</p>
                <p className="text-xl font-bold">${results.overheadCost.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t[compatibleLanguage].results.totalCost}</p>
                <p className="text-xl font-bold">${results.totalCost.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="border-t border-b py-4 my-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t[compatibleLanguage].results.suggestedPrice}</p>
                  <p className="text-2xl font-bold text-success">${results.suggestedPrice.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t[compatibleLanguage].results.profitMargin}</p>
                  <p className="text-2xl font-bold text-primary">{results.profitMargin.toFixed(1)}%</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center">
              <Button onClick={handlePrint} variant="outline" className="flex gap-2 items-center">
                <Printer className="w-4 h-4" />
                {t[compatibleLanguage].buttons.print}
              </Button>
              <Button onClick={handleDownload} className="flex gap-2 items-center">
                <Download className="w-4 h-4" />
                {t[compatibleLanguage].buttons.download}
              </Button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <CardTitle>{t[compatibleLanguage].title}</CardTitle>
            <CardDescription>{t[compatibleLanguage].description}</CardDescription>
          </div>
        </div>
        
        <div className="flex justify-between mt-4 border-b pb-2">
          {Object.keys(t[compatibleLanguage].steps).map((stepKey) => (
            <div 
              key={stepKey} 
              className={`text-sm px-2 py-1 ${step === stepKey ? 'font-bold border-b-2 border-blue-500' : 'text-gray-500'}`}
            >
              {t[compatibleLanguage].steps[stepKey as keyof typeof t[typeof compatibleLanguage]['steps']]}
            </div>
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        {renderStepContent()}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        {step !== 'info' && (
          <Button variant="ghost" onClick={handleBack} className="flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t[compatibleLanguage].buttons.back}
          </Button>
        )}
        <div className="flex-1"></div>
        {step !== 'results' ? (
          <Button onClick={handleNext}>
            {t[compatibleLanguage].buttons.next}
          </Button>
        ) : (
          <Button variant="default" onClick={() => setStep('info')}>
            {t[compatibleLanguage].buttons.finish}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
