
import React from 'react';
import { Megaphone, ShoppingCart } from 'lucide-react';
import { Agent } from './types';

export const getAgents = (): Agent[] => {
  return [
    // Accounting Agent
    {
      id: "accounting",
      icon: (
        <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      ),
      color: "bg-gradient-to-br from-indigo-500 to-purple-600",
      title: {
        en: "Accounting Agent",
        es: "Agente Contable"
      },
      question: {
        en: "I need help categorizing my expenses for tax season",
        es: "Necesito ayuda para categorizar mis gastos para la temporada de impuestos"
      },
      response: {
        en: "I've analyzed your expenses and created categories based on tax deduction opportunities. Would you like me to generate monthly financial reports for your business?",
        es: "He analizado tus gastos y creado categorías basadas en oportunidades de deducción de impuestos. ¿Te gustaría que generara informes financieros mensuales para tu negocio?"
      },
      responseColor: "bg-purple-900/30 border-purple-700/30 text-purple-100",
      chatEnabled: true
    },
    
    // Operations Manager
    {
      id: "operations",
      icon: (
        <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
      ),
      color: "bg-gradient-to-br from-pink-500 to-purple-600",
      title: {
        en: "Operations Manager",
        es: "Gerente de Operaciones"
      },
      question: {
        en: "We need to streamline our client onboarding process",
        es: "Necesitamos optimizar nuestro proceso de incorporación de clientes"
      },
      response: {
        en: "I've analyzed your current workflow and identified 3 bottlenecks. Let me create a new process map with automated notifications and document collection to reduce onboarding time by 40%.",
        es: "He analizado tu flujo de trabajo actual y he identificado 3 cuellos de botella. Permíteme crear un nuevo mapa de procesos con notificaciones automatizadas y recopilación de documentos para reducir el tiempo de incorporación en un 40%."
      },
      responseColor: "bg-accent/30 border-accent/30 text-accent-foreground",
      chatEnabled: true
    },
    
    // Legal Advisor
    {
      id: "legal",
      icon: (
        <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
      ),
      color: "bg-gradient-to-br from-blue-500 to-cyan-600",
      title: {
        en: "Legal Advisor",
        es: "Asesor Legal"
      },
      question: {
        en: "I need a contract template for new client projects",
        es: "Necesito una plantilla de contrato para nuevos proyectos con clientes"
      },
      response: {
        en: "Based on your industry and project scope, I've drafted a comprehensive contract with clear payment terms, intellectual property clauses, and milestone deliverables. Would you like me to add specific confidentiality requirements?",
        es: "Basado en tu industria y alcance del proyecto, he redactado un contrato integral con términos de pago claros, cláusulas de propiedad intelectual y entregables por hitos. ¿Te gustaría que agregara requisitos específicos de confidencialidad?"
      },
      responseColor: "bg-blue-900/30 border-blue-700/30 text-blue-100",
      chatEnabled: true
    },
    
    // Administrative Assistant
    {
      id: "admin",
      icon: (
        <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
        </svg>
      ),
      color: "bg-gradient-to-br from-emerald-500 to-teal-600",
      title: {
        en: "Administrative Assistant",
        es: "Asistente Administrativo"
      },
      question: {
        en: "Can you help me organize my calendar and emails for the next project launch?",
        es: "¿Puedes ayudarme a organizar mi calendario y correos electrónicos para el próximo lanzamiento del proyecto?"
      },
      response: {
        en: "I've sorted your emails by priority and created calendar blocks for focused work. I've also drafted response templates for common inquiries and scheduled weekly team status updates.",
        es: "He ordenado tus correos electrónicos por prioridad y creado bloques en el calendario para trabajo enfocado. También he redactado plantillas de respuesta para consultas comunes y programado actualizaciones semanales de estado del equipo."
      },
      responseColor: "bg-emerald-900/30 border-emerald-700/30 text-emerald-100",
      chatEnabled: true
    },
    
    // Marketing & Social Media Agent
    {
      id: "marketing",
      icon: <Megaphone className="w-5 h-5 md:w-6 md:h-6 text-white" />,
      color: "bg-gradient-to-br from-amber-500 to-orange-600",
      title: {
        en: "Marketing & Social Media Agent",
        es: "Agente de Marketing y Redes Sociales"
      },
      question: {
        en: "I need help creating a content calendar for our social media",
        es: "Necesito ayuda para crear un calendario de contenido para nuestras redes sociales"
      },
      response: {
        en: "I've analyzed your audience demographics and engagement patterns. Here's a 3-month content calendar with themes, posting times, and campaign ideas tailored to increase your reach by 35%.",
        es: "He analizado la demografía de tu audiencia y patrones de engagement. Aquí tienes un calendario de contenido de 3 meses con temas, horarios de publicación e ideas de campaña diseñadas para aumentar tu alcance en un 35%."
      },
      responseColor: "bg-amber-900/30 border-amber-700/30 text-amber-100",
      chatEnabled: false
    },
    
    // Catalog & Inventory Manager
    {
      id: "inventory",
      icon: <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-white" />,
      color: "bg-gradient-to-br from-violet-500 to-fuchsia-600",
      title: {
        en: "Catalog & Inventory Manager",
        es: "Gestor de Catálogo e Inventario"
      },
      question: {
        en: "How can I track inventory levels across multiple sales channels?",
        es: "¿Cómo puedo seguir los niveles de inventario en múltiples canales de venta?"
      },
      response: {
        en: "I've set up an automated inventory tracking system that syncs across all your sales platforms. You'll get real-time updates and low stock alerts, plus I can generate forecasting reports based on seasonal trends.",
        es: "He configurado un sistema automatizado de seguimiento de inventario que se sincroniza en todas tus plataformas de venta. Recibirás actualizaciones en tiempo real y alertas de stock bajo, además puedo generar informes de pronóstico basados en tendencias estacionales."
      },
      responseColor: "bg-violet-900/30 border-violet-700/30 text-violet-100",
      chatEnabled: false
    },
    
    // Cultural Creator Agent
    {
      id: "cultural",
      icon: (
        <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path>
        </svg>
      ),
      color: "bg-gradient-to-br from-pink-500 to-rose-600",
      title: {
        en: "Cultural Creator Agent",
        es: "Agente para Creadores Culturales"
      },
      question: {
        en: "I need help pricing my artwork for an upcoming exhibition",
        es: "Necesito ayuda para fijar el precio de mi obra para una próxima exposición"
      },
      response: {
        en: "I've analyzed comparable works in your market segment and considered your exhibition history. Here's a pricing strategy that accounts for materials, production time, and your growing reputation in the art world.",
        es: "He analizado obras comparables en tu segmento de mercado y considerado tu historial de exposiciones. Aquí tienes una estrategia de precios que tiene en cuenta los materiales, el tiempo de producción y tu creciente reputación en el mundo del arte."
      },
      responseColor: "bg-rose-900/30 border-rose-700/30 text-rose-100",
      chatEnabled: true
    }
  ];
};
