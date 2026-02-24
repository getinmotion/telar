export const getContextualMessage = (questionId: string, selectedValue: string, language: 'en' | 'es'): string => {
  const messages = {
    en: {
      industry: {
        'music': "🎵 Cool, you're in music! Tell me more about what kind of music you create or perform. Are you more into traditional styles or do you experiment with modern genres?",
        'visual-arts': "🎨 Visual arts, awesome! What's your medium? Painting, sculpture, photography? I'd love to hear about the style or themes you explore in your work.",
        'performing-arts': "🎭 Performing arts, how exciting! Are you into theater, dance, circus, or something else? What draws you to live performance?",
        'literature': "📚 A writer! That's fantastic. What genre do you focus on? Fiction, poetry, essays? Do you write in your native language or explore other languages too?",
        'audiovisual': "🎬 Audiovisual work, very cool! Are you more into filmmaking, video art, documentaries? Tell me about the projects you're working on.",
        'digital-arts': "💻 Digital arts! That's such a dynamic field. Are you creating digital illustrations, interactive media, NFTs, or something else? What tools do you love working with?",
        'arts-crafts': "✂️ Arts & crafts, how wonderful! Tell me more about what you create. Do you work with traditional techniques passed down through generations, or do you put a modern twist on classic crafts?"
      },
      paymentMethods: {
        'cash': "💰 I see you handle cash transactions. How's that working for you? Have you thought about exploring other payment methods to make things easier for your customers?",
        'bank-transfer': "🏦 Bank transfers, that's quite formal! Do you find clients are comfortable with that method? Any challenges with processing times?",
        'digital-wallet': "📱 Digital payments, nice and modern! Which platforms do you use? PayPal, Venmo, or something local? How do your clients respond to it?",
        'mixed': "🔄 A mix of payment methods, smart approach! Which one do your clients prefer? Any particular challenges juggling different systems?"
      },
      brandIdentity: {
        'none': "🤔 No worries about not having a defined brand yet! Many successful creators start exactly where you are. What comes to mind when you think about how you'd want people to see your work?",
        'basic': "🌱 Having some basic branding is a great start! What elements do you have so far? Logo, colors, or maybe just a consistent style in how you present your work?",
        'complete': "✨ That's fantastic that you have a complete brand identity! What's the story behind your brand? How did you develop it and what does it represent about your creative work?"
      }
    },
    es: {
      industry: {
        'music': "🎵 ¡Qué genial que te dediques a la música! Cuéntame más sobre qué tipo de música creates o interpretas. ¿Te va más lo tradicional o experimentas con géneros modernos?",
        'visual-arts': "🎨 ¡Artes visuales, increíble! ¿Cuál es tu técnica? ¿Pintura, escultura, fotografía? Me encantaría saber sobre el estilo o temas que explores en tu trabajo.",
        'performing-arts': "🎭 ¡Artes escénicas, qué emocionante! ¿Te va el teatro, danza, circo, o algo más? ¿Qué te atrae de las presentaciones en vivo?",
        'literature': "📚 ¡Un/a escritor/a! Qué fantástico. ¿En qué género te enfocas? ¿Ficción, poesía, ensayos? ¿Escribes en tu idioma natal o también exploras otros idiomas?",
        'audiovisual': "🎬 ¡Trabajo audiovisual, muy cool! ¿Te va más el cine, videoarte, documentales? Cuéntame sobre los proyectos en los que estás trabajando.",
        'digital-arts': "💻 ¡Artes digitales! Es un campo súper dinámico. ¿Haces ilustraciones digitales, medios interactivos, NFTs, o algo más? ¿Con qué herramientas te gusta trabajar?",
        'arts-crafts': "✂️ ¡Artesanías, qué maravilloso! Cuéntame más sobre lo que creates. ¿Trabajas con técnicas tradicionales que se pasan de generación en generación, o le das un toque moderno a las artesanías clásicas?"
      },
      paymentMethods: {
        'cash': "💰 Veo que manejas efectivo. ¿Qué tal te va con eso? ¿Has pensado en explorar otros métodos de pago para facilitarles las cosas a tus clientes?",
        'bank-transfer': "🏦 Transferencias bancarias, ¡qué formal! ¿Los clientes se sienten cómodos con ese método? ¿Algún desafío con los tiempos de procesamiento?",
        'digital-wallet': "📱 Pagos digitales, ¡moderno y práctico! ¿Qué plataformas usas? ¿PayPal, alguna billetera local? ¿Cómo responden tus clientes?",
        'mixed': "🔄 Una mezcla de métodos de pago, ¡enfoque inteligente! ¿Cuál prefieren tus clientes? ¿Algún desafío particular manejando diferentes sistemas?"
      },
      brandIdentity: {
        'none': "🤔 ¡No te preocupes por no tener una marca definida todavía! Muchos creadores exitosos empezaron exactamente donde estás tú. ¿Qué se te viene a la mente cuando piensas en cómo te gustaría que la gente vea tu trabajo?",
        'basic': "🌱 ¡Tener algo básico de marca es un gran comienzo! ¿Qué elementos tienes hasta ahora? ¿Logo, colores, o tal vez solo un estilo consistente en cómo presentas tu trabajo?",
        'complete': "✨ ¡Qué fantástico que tengas una identidad de marca completa! ¿Cuál es la historia detrás de tu marca? ¿Cómo la desarrollaste y qué representa sobre tu trabajo creativo?"
      }
    }
  };

  const questionMessages = messages[language][questionId as keyof typeof messages['en']];
  if (questionMessages && typeof questionMessages === 'object') {
    return (questionMessages as Record<string, string>)[selectedValue] || 
           (language === 'es' ? 
            '¡Interesante elección! Cuéntame más sobre eso.' : 
            'Interesting choice! Tell me more about that.');
  }
  
  return language === 'es' ? 
    '¡Interesante elección! Cuéntame más sobre eso.' : 
    'Interesting choice! Tell me more about that.';
};
