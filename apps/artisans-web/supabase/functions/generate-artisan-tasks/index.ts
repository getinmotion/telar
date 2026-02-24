import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ArtisanProfile {
  name: string;
  productType: string;
  hasSold: 'yes' | 'no' | 'sometimes';
  timeInvested: string;
  knowsCosts: 'yes' | 'no';
  dreamGoal: string;
  costDetails?: string;
  salesExperience?: string;
  timePerProduct?: string;
  industry: string;
  experience: string;
}

interface ArtisanTaskStep {
  stepNumber: number;
  title: string;
  description: string;
  inputType: 'text' | 'calculation' | 'checklist' | 'file' | 'selection';
  guidance: string;
  expectedOutput: string;
  validationCriteria: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId, profileData, language = 'es', incremental = false } = await req.json();

    if (!userId || !profileData) {
      throw new Error('Missing required parameters');
    }

    console.log('Generating artisan tasks for user:', userId, 'incremental:', incremental);

    const isSpanish = language === 'es';
    const profile = profileData as ArtisanProfile;
    
    // Generate artisan-specific tasks
    const artisanTasks = generateArtisanTasks(profile, language);
    
    // If incremental, only take the first 3 most important tasks
    const tasksToCreate = incremental ? artisanTasks.slice(0, 3) : artisanTasks;
    
    console.log(`Creating ${tasksToCreate.length} tasks (${incremental ? 'incremental' : 'full'} generation)`);
    
    // Insert tasks into database
    const tasksCreated = [];
    
    for (const taskTemplate of tasksToCreate) {
      // Insert main task
      const { data: task, error: taskError } = await supabase
        .from('agent_tasks')
        .insert({
          user_id: userId,
          agent_id: taskTemplate.agentId,
          title: taskTemplate.title,
          description: taskTemplate.description,
          priority: taskTemplate.priority === 'Alta' ? 1 : taskTemplate.priority === 'Media' ? 2 : 3,
          category: taskTemplate.category,
          status: 'pending',
          estimated_time: taskTemplate.estimatedTime,
          relevance: taskTemplate.impact >= 4 ? 'high' : 'medium',
          progress_percentage: 0
        })
        .select()
        .single();

      if (taskError) {
        console.error('Error creating task:', taskError);
        continue;
      }

      console.log('Created task:', task.title);

      // Insert task steps
      for (const step of taskTemplate.steps) {
        const { error: stepError } = await supabase
          .from('task_steps')
          .insert({
            task_id: task.id,
            step_number: step.stepNumber,
            title: step.title,
            description: step.description,
            input_type: step.inputType,
            ai_context_prompt: step.guidance,
            completion_status: 'pending',
            validation_criteria: step.validationCriteria,
            user_input_data: {}
          });

        if (stepError) {
          console.error('Error creating step:', stepError);
        }
      }

      tasksCreated.push(task);
    }

    console.log(`Successfully created ${tasksCreated.length} artisan tasks`);

    return new Response(
      JSON.stringify({
        success: true,
        tasksCreated: tasksCreated.length,
        tasks: tasksCreated,
        profileAnalysis: {
          isArtisan: true,
          artisanType: profile.productType,
          experienceLevel: profile.experience,
          salesReady: profile.hasSold !== 'no',
          needsCostHelp: profile.knowsCosts === 'no',
          timeCommitment: profile.timeInvested
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in generate-artisan-tasks function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

function generateArtisanTasks(profile: ArtisanProfile, language: 'en' | 'es') {
  const isSpanish = language === 'es';
  const tasks = [];

  // Task 1: Cost Calculation - Always first for artisans who don't know costs
  if (profile.knowsCosts === 'no') {
    tasks.push({
      title: isSpanish ? `Calcular el costo real de cada ${profile.productType}` : `Calculate real cost of each ${profile.productType}`,
      description: isSpanish 
        ? `Te ayudo a determinar exactamente cuánto te cuesta producir cada ${profile.productType} para que puedas establecer precios justos y rentables.`
        : `I'll help you determine exactly how much it costs to produce each ${profile.productType} so you can set fair and profitable prices.`,
      priority: 'Alta',
      category: 'Finanzas',
      estimatedTime: isSpanish ? '45 minutos' : '45 minutes',
      impact: 5,
      agentId: 'cost-calculator',
      steps: [
        {
          stepNumber: 1,
          title: isSpanish ? 'Lista tus materiales e insumos' : 'List your materials and supplies',
          description: isSpanish 
            ? `Anota todos los materiales que necesitas para hacer un ${profile.productType}: hilos, relleno, accesorios, herramientas, etc.`
            : `Write down all materials needed to make one ${profile.productType}: threads, filling, accessories, tools, etc.`,
          inputType: 'checklist',
          guidance: isSpanish 
            ? 'Incluye hasta el material más pequeño. Es mejor sobrestimar que quedarse corto.'
            : 'Include even the smallest material. Better to overestimate than fall short.',
          expectedOutput: isSpanish ? 'Lista completa de materiales con cantidades' : 'Complete list of materials with quantities',
          validationCriteria: { minItems: 3, hasQuantities: true }
        },
        {
          stepNumber: 2,
          title: isSpanish ? 'Calcula el costo de materiales' : 'Calculate material costs',
          description: isSpanish 
            ? 'Suma el costo total de todos los materiales para un producto'
            : 'Add up the total cost of all materials for one product',
          inputType: 'calculation',
          guidance: isSpanish 
            ? 'Si compras por lotes, divide el costo total entre la cantidad de productos que puedes hacer'
            : 'If you buy in bulk, divide total cost by number of products you can make',
          expectedOutput: isSpanish ? 'Costo total de materiales por unidad' : 'Total material cost per unit',
          validationCriteria: { isNumeric: true, minValue: 0 }
        },
        {
          stepNumber: 3,
          title: isSpanish ? 'Mide tu tiempo de elaboración' : 'Measure your production time',
          description: isSpanish 
            ? `Cronometra cuánto tardas en hacer un ${profile.productType} completo`
            : `Time how long it takes to make one complete ${profile.productType}`,
          inputType: 'text',
          guidance: isSpanish 
            ? 'Incluye tiempo de preparación, elaboración y acabados. Hazlo con 2-3 productos para obtener un promedio'
            : 'Include prep time, creation and finishing. Do this with 2-3 products to get an average',
          expectedOutput: isSpanish ? 'Tiempo promedio en horas' : 'Average time in hours',
          validationCriteria: { hasTimeFormat: true }
        },
        {
          stepNumber: 4,
          title: isSpanish ? 'Define tu valor por hora' : 'Define your hourly rate',
          description: isSpanish 
            ? 'Decide cuánto quieres ganar por cada hora de trabajo'
            : 'Decide how much you want to earn per hour of work',
          inputType: 'calculation',
          guidance: isSpanish 
            ? 'Considera tu experiencia, la calidad de tu trabajo y lo que cobran otros artesanos similares'
            : 'Consider your experience, work quality and what similar artisans charge',
          expectedOutput: isSpanish ? 'Valor por hora en moneda local' : 'Hourly rate in local currency',
          validationCriteria: { isNumeric: true, minValue: 1 }
        },
        {
          stepNumber: 5,
          title: isSpanish ? 'Calcula tu precio final' : 'Calculate your final price',
          description: isSpanish 
            ? 'Suma materiales + tiempo + margen de ganancia'
            : 'Add materials + time + profit margin',
          inputType: 'calculation',
          guidance: isSpanish 
            ? 'Precio = (Costo materiales) + (Horas de trabajo × Valor por hora) + 20% de margen'
            : 'Price = (Material cost) + (Work hours × Hourly rate) + 20% margin',
          expectedOutput: isSpanish ? 'Precio de venta sugerido' : 'Suggested selling price',
          validationCriteria: { isNumeric: true, coversAllCosts: true }
        }
      ]
    });
  }

  // Task 2: Monthly Income Goal
  if (profile.dreamGoal.toLowerCase().includes('vivir') || profile.dreamGoal.toLowerCase().includes('live') || 
      profile.dreamGoal.toLowerCase().includes('ganar') || profile.dreamGoal.toLowerCase().includes('earn')) {
    tasks.push({
      title: isSpanish ? 'Definir meta mensual para vivir de tu arte' : 'Define monthly goal to live from your art',
      description: isSpanish 
        ? 'Calculamos cuántos productos necesitas hacer y vender al mes para alcanzar tus objetivos económicos.'
        : 'We calculate how many products you need to make and sell monthly to reach your financial goals.',
      priority: 'Alta',
      category: 'Planificación',
      estimatedTime: isSpanish ? '30 minutos' : '30 minutes',
      impact: 5,
      agentId: 'financial-planner',
      steps: [
        {
          stepNumber: 1,
          title: isSpanish ? 'Define tus gastos mensuales básicos' : 'Define your basic monthly expenses',
          description: isSpanish 
            ? 'Lista cuánto necesitas para vivir: comida, casa, transporte, servicios, etc.'
            : 'List what you need to live: food, housing, transport, utilities, etc.',
          inputType: 'calculation',
          guidance: isSpanish 
            ? 'Sé realista. Incluye un 10% extra para imprevistos.'
            : 'Be realistic. Include 10% extra for unexpected expenses.',
          expectedOutput: isSpanish ? 'Total de gastos mensuales' : 'Total monthly expenses',
          validationCriteria: { isNumeric: true, minValue: 100 }
        },
        {
          stepNumber: 2,
          title: isSpanish ? 'Establece tu meta de ingresos deseados' : 'Set your desired income goal',
          description: isSpanish 
            ? 'Decide cuánto quieres ganar además de cubrir gastos básicos'
            : 'Decide how much you want to earn beyond covering basic expenses',
          inputType: 'calculation',
          guidance: isSpanish 
            ? 'Piensa en ahorros, gustos personales, vacaciones, crecimiento del negocio'
            : 'Think about savings, personal treats, vacations, business growth',
          expectedOutput: isSpanish ? 'Meta de ingresos mensuales' : 'Monthly income goal',
          validationCriteria: { isNumeric: true, exceedsBasicNeeds: true }
        },
        {
          stepNumber: 3,
          title: isSpanish ? 'Calcula productos necesarios por mes' : 'Calculate products needed per month',
          description: isSpanish 
            ? 'Divide tu meta de ingresos entre el precio de tus productos'
            : 'Divide your income goal by your product price',
          inputType: 'calculation',
          guidance: isSpanish 
            ? 'Si aún no tienes precio definido, usa una estimación basada en materiales y tiempo'
            : 'If you don\'t have a set price yet, use an estimate based on materials and time',
          expectedOutput: isSpanish ? 'Cantidad de productos a vender mensualmente' : 'Number of products to sell monthly',
          validationCriteria: { isNumeric: true, isRealistic: true }
        }
      ]
    });
  }

  // Task 3: Brand Creation
  if (profile.hasSold === 'no' || profile.dreamGoal.toLowerCase().includes('reconoc') || 
      profile.dreamGoal.toLowerCase().includes('known') || profile.dreamGoal.toLowerCase().includes('brand')) {
    tasks.push({
      title: isSpanish ? 'Crear tu marca artesanal' : 'Create your artisan brand',
      description: isSpanish 
        ? 'Desarrolla una identidad única para tu trabajo que te ayude a destacar y ser recordada.'
        : 'Develop a unique identity for your work that helps you stand out and be remembered.',
      priority: 'Media',
      category: 'Marca',
      estimatedTime: isSpanish ? '60 minutos' : '60 minutes',
      impact: 4,
      agentId: 'brand-developer',
      steps: [
        {
          stepNumber: 1,
          title: isSpanish ? 'Define tu propuesta única de valor' : 'Define your unique value proposition',
          description: isSpanish 
            ? `¿Qué hace especiales tus ${profile.productType}? ¿Qué los diferencia de otros?`
            : `What makes your ${profile.productType} special? How are they different from others?`,
          inputType: 'text',
          guidance: isSpanish 
            ? 'Piensa en técnica, materiales, estilo, historia personal, acabados, etc.'
            : 'Think about technique, materials, style, personal story, finishes, etc.',
          expectedOutput: isSpanish ? 'Descripción clara de tu diferenciación' : 'Clear description of your differentiation',
          validationCriteria: { hasUniqueElements: true, isSpecific: true }
        }
      ]
    });
  }

  return tasks;
}