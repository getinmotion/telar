import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { markTaskAsCompleted } from './utils/taskCompletionHelpers';
import { toast } from '@/hooks/use-toast';
import { useGamificationRewards } from './useGamificationRewards';
import { getAgentTasksByUserId } from '@/services/agentTasks.actions';
import { getArtisanShopByUserId } from '@/services/artisanShops.actions';
import { getProductsByUserId } from '@/services/products.actions';
import { getUserProfileByUserId } from '@/services/userProfiles.actions';

/**
 * Hook que automáticamente detecta y completa tareas cuando se cumplen sus condiciones
 */
export const useAutoTaskCompletion = () => {
  const { user } = useAuth();
  const { celebrateSuccess } = useGamificationRewards();

  // useEffect(() => {
  //   if (!user) return;

  //   const checkAndCompleteAutoTasks = async () => {
  //     try {
  //       console.log('🔍 [Auto-Task] Verificando tareas para auto-completar...');

  //       // ✅ Migrado a NestJS - GET /agent-tasks/user/{user_id}
  //       const allTasks = await getAgentTasksByUserId(user.id);

  //       // Filtrar solo tareas pendientes o en progreso
  //       const tasks = allTasks.filter(task => 
  //         task.status === 'pending' || task.status === 'in_progress'
  //       );

  //       if (!tasks || tasks.length === 0) {
  //         console.log('ℹ️ [Auto-Task] No hay tareas pendientes');
  //         return;
  //       }

  //       console.log(`📋 [Auto-Task] Encontradas ${tasks.length} tareas pendientes`);

  //       // ✅ Migrado a NestJS - GET /artisan-shops/user/{user_id}
  //       const shop = await getArtisanShopByUserId(user.id).catch((error) => {
  //         console.error('❌ [Auto-Task] Error obteniendo tienda:', error);
  //         return null;
  //       });

  //       const hasLogo = !!shop?.logoUrl;
  //       const hasHeroSlider = !!(shop?.heroConfig as any)?.slides?.length;
  //       const hasStory = !!(shop?.story || (shop?.aboutContent as any)?.story);
  //       const hasSocialLinks = !!(shop?.socialLinks && Object.keys(shop.socialLinks as object).length > 0);
  //       const contactInfo = (shop?.contactInfo as any) || {};
  //       const hasContactInfo = !!(contactInfo?.email || contactInfo?.phone);

  //       let productCount = 0;

  //       // ✅ Migrado a NestJS - GET /products/user/{user_id}
  //       if (shop?.id) {
  //         try {
  //           const products = await getProductsByUserId(user.id);
  //           productCount = products.length;
  //           console.log(`📦 [Auto-Task] Usuario tiene ${productCount} producto(s) en su tienda`);
  //         } catch (error) {
  //           console.error('❌ [Auto-Task] Error contando productos:', error);
  //           productCount = 0;
  //         }
  //       } else {
  //         console.log('ℹ️ [Auto-Task] Usuario no tiene tienda todavía');
  //       }

  //       // ✅ Migrado a NestJS - GET /user-profiles/user/{user_id}
  //       const profile = await getUserProfileByUserId(user.id).catch((error) => {
  //         console.error('❌ [Auto-Task] Error obteniendo perfil:', error);
  //         return null;
  //       });

  //       const hasRUT = !!(profile?.rut && !profile?.rutPendiente);

  //       console.log(`🎨 [Auto-Task] Estado - Logo: ${hasLogo}, Hero: ${hasHeroSlider}, Historia: ${hasStory}, Social: ${hasSocialLinks}, Contacto: ${hasContactInfo}, RUT: ${hasRUT}`);

  //       // Revisar cada tarea y completar si se cumplen condiciones
  //       for (const task of tasks) {
  //         let shouldComplete = false;
  //         let reason = '';
  //         const titleLower = task.title.toLowerCase();
  //         const descLower = (task.description || '').toLowerCase();

  //         console.log(`🔎 [Auto-Task] Evaluando tarea: "${task.title}" (${task.status})`);

  //         // ✅ Tarea: Crear tienda online
  //         if (
  //           (titleLower.includes('crea tu tienda') ||
  //            titleLower.includes('crear tienda') ||
  //            titleLower.includes('tienda online') ||
  //            titleLower.includes('create shop')) &&
  //           !!shop
  //         ) {
  //           shouldComplete = true;
  //           reason = 'Usuario tiene tienda creada';
  //           console.log(`✅ [Auto-Task] COMPLETAR: ${reason}`);
  //         }

  //         // ✅ Tarea: Subir primer producto
  //         if (
  //           (titleLower.includes('primer producto') || 
  //            titleLower.includes('first product') ||
  //            titleLower.includes('sube tu primer producto') ||
  //            (titleLower.includes('sube') && titleLower.includes('producto'))) &&
  //           (productCount || 0) > 0
  //         ) {
  //           shouldComplete = true;
  //           reason = `Usuario tiene ${productCount} producto(s)`;
  //           console.log(`✅ [Auto-Task] COMPLETAR: ${reason}`);
  //         }

  //         // ✅ Tarea: 5 productos
  //         if (
  //           (titleLower.includes('5 productos') ||
  //            titleLower.includes('cinco productos') ||
  //            titleLower.includes('five products')) &&
  //           (productCount || 0) >= 5
  //         ) {
  //           shouldComplete = true;
  //           reason = `Usuario tiene ${productCount} productos`;
  //           console.log(`✅ [Auto-Task] COMPLETAR: ${reason}`);
  //         }

  //         // ✅ Tarea: 10 productos
  //         if (
  //           (titleLower.includes('10 productos') ||
  //            titleLower.includes('diez productos') ||
  //            titleLower.includes('ten products')) &&
  //           (productCount || 0) >= 10
  //         ) {
  //           shouldComplete = true;
  //           reason = `Usuario tiene ${productCount} productos`;
  //           console.log(`✅ [Auto-Task] COMPLETAR: ${reason}`);
  //         }

  //         // ✅ Tarea: Evaluar identidad de marca / Logo
  //         if (
  //           (titleLower.includes('identidad visual') || 
  //            titleLower.includes('identidad de marca') ||
  //            titleLower.includes('evalúa tu identidad') ||
  //            titleLower.includes('evaluar identidad') ||
  //            titleLower.includes('marca') ||
  //            titleLower.includes('brand identity') ||
  //            titleLower.includes('logo') ||
  //            descLower.includes('logo') || 
  //            descLower.includes('colores') ||
  //            descLower.includes('marca')) &&
  //           hasLogo
  //         ) {
  //           shouldComplete = true;
  //           reason = 'Tienda configurada con logo';
  //           console.log(`✅ [Auto-Task] COMPLETAR: ${reason}`);
  //         }

  //         // ✅ Tarea: Personalizar tienda / Hero Slider
  //         if (
  //           (titleLower.includes('personaliza tu tienda') ||
  //            titleLower.includes('hero slider') ||
  //            titleLower.includes('customize shop') ||
  //            titleLower.includes('configura hero') ||
  //            descLower.includes('hero') ||
  //            descLower.includes('slider')) &&
  //           hasHeroSlider
  //         ) {
  //           shouldComplete = true;
  //           reason = 'Hero slider configurado';
  //           console.log(`✅ [Auto-Task] COMPLETAR: ${reason}`);
  //         }

  //         // ✅ Tarea: Historia / About / Nosotros
  //         if (
  //           (titleLower.includes('historia') ||
  //            titleLower.includes('about') ||
  //            titleLower.includes('nosotros') ||
  //            titleLower.includes('story') ||
  //            titleLower.includes('cuenta tu historia') ||
  //            descLower.includes('historia') ||
  //            descLower.includes('about')) &&
  //           hasStory
  //         ) {
  //           shouldComplete = true;
  //           reason = 'Sección de historia/about configurada';
  //           console.log(`✅ [Auto-Task] COMPLETAR: ${reason}`);
  //         }

  //         // ✅ Tarea: Contacto
  //         if (
  //           (titleLower.includes('contacto') ||
  //            titleLower.includes('contact') ||
  //            titleLower.includes('información de contacto') ||
  //            descLower.includes('contacto') ||
  //            descLower.includes('teléfono') ||
  //            descLower.includes('email')) &&
  //           hasContactInfo
  //         ) {
  //           shouldComplete = true;
  //           reason = 'Información de contacto configurada';
  //           console.log(`✅ [Auto-Task] COMPLETAR: ${reason}`);
  //         }

  //         // ✅ Tarea: Redes Sociales
  //         if (
  //           (titleLower.includes('redes sociales') ||
  //            titleLower.includes('social media') ||
  //            titleLower.includes('social links') ||
  //            titleLower.includes('agrega redes') ||
  //            descLower.includes('redes sociales') ||
  //            descLower.includes('instagram') ||
  //            descLower.includes('facebook')) &&
  //           hasSocialLinks
  //         ) {
  //           shouldComplete = true;
  //           reason = 'Redes sociales configuradas';
  //           console.log(`✅ [Auto-Task] COMPLETAR: ${reason}`);
  //         }

  //         // ✅ Tarea: RUT / Formalización
  //         if (
  //           (titleLower.includes('rut') ||
  //            titleLower.includes('formaliza') ||
  //            titleLower.includes('formalización') ||
  //            titleLower.includes('legal') ||
  //            descLower.includes('rut') ||
  //            descLower.includes('formaliza')) &&
  //           hasRUT
  //         ) {
  //           shouldComplete = true;
  //           reason = 'RUT registrado';
  //           console.log(`✅ [Auto-Task] COMPLETAR: ${reason}`);
  //         }

  //         // Completar la tarea si se cumple la condición
  //         if (shouldComplete && task.status !== 'completed') {
  //           try {
  //             console.log(`🎯 [Auto-Task] Marcando como completada: "${task.title}"`);
  //             await markTaskAsCompleted(task.id, user.id);
  //             console.log(`✅ [Auto-Task] Tarea completada exitosamente: ${task.title}`);

  //             // 🎉 Mostrar notificación celebratoria
  //             toast({
  //               title: "🎉 ¡Tarea Completada!",
  //               description: `Has completado: ${task.title}`,
  //               duration: 5000,
  //             });

  //             // 🎊 Lanzar confetti
  //             celebrateSuccess();
  //           } catch (error) {
  //             console.error(`❌ [Auto-Task] Error completando tarea ${task.id}:`, error);
  //           }
  //         } else if (!shouldComplete) {
  //           console.log(`⏭️ [Auto-Task] Tarea no cumple condiciones: "${task.title}"`);
  //         }
  //       }

  //       console.log('✅ [Auto-Task] Verificación completada');
  //     } catch (error) {
  //       console.error('❌ [Auto-Task] Error en checkAndCompleteAutoTasks:', error);
  //     }
  //   };

  //   // Ejecutar inmediatamente y luego cada 30 segundos
  //   console.log('🚀 [Auto-Task] Inicializando sistema de auto-completado');
  //   checkAndCompleteAutoTasks();
  //   const interval = setInterval(checkAndCompleteAutoTasks, 30000);

  //   return () => {
  //     console.log('🛑 [Auto-Task] Deteniendo sistema de auto-completado');
  //     clearInterval(interval);
  //   };
  // }, [user?.id, celebrateSuccess]);
};
