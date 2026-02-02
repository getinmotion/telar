import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

function generateGiftCardCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "GC-";
  for (let j = 0; j < 3; j++) {
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (j < 2) result += "-";
  }
  return result;
}

function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(amount);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function generateGiftCardEmailHtml(
  orderId: string, 
  giftCards: Array<{
    code: string;
    amount: number;
    recipient_email?: string | null;
    expiration_date?: string | null;
    message?: string | null;
  }>
): string {
  const totalAmount = giftCards.reduce((sum, gc) => sum + gc.amount, 0);
  
  const giftCardCardsHtml = giftCards.map((gc, index) => `
    <div style="background: linear-gradient(135deg, #142239 0%, #1e3a5f 100%); border-radius: 16px; padding: 24px; margin-bottom: 16px; color: white;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
        <div>
          <p style="margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8;">Gift Card ${giftCards.length > 1 ? `#${index + 1}` : ''}</p>
          <p style="margin: 8px 0 0 0; font-size: 28px; font-weight: bold; color: #ffc716;">${formatCOP(gc.amount)}</p>
        </div>
        <div style="text-align: right;">
          <img src="https://ylooqmqmoufqtxvetxuj.supabase.co/storage/v1/object/public/site-assets/logo-horizontal.svg" alt="TELAR" style="height: 32px; opacity: 0.9;" />
        </div>
      </div>
      
      <div style="background: rgba(255,255,255,0.1); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        <p style="margin: 0 0 4px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.7;">Código</p>
        <p style="margin: 0; font-family: 'Courier New', monospace; font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #ffc716;">${gc.code}</p>
      </div>
      
      ${gc.expiration_date ? `
        <p style="margin: 0 0 8px 0; font-size: 13px; opacity: 0.8;">
          <span style="color: #f48c5f;">⏰</span> Válido hasta: <strong>${formatDate(gc.expiration_date)}</strong>
        </p>
      ` : ''}
      
      ${gc.recipient_email ? `
        <div style="background: rgba(244,140,95,0.2); border-radius: 8px; padding: 12px; margin-top: 12px;">
          <p style="margin: 0; font-size: 13px;">
            <span style="color: #f48c5f;">🎁</span> Esta gift card es un regalo para: <strong>${gc.recipient_email}</strong>
          </p>
          ${gc.message ? `
            <p style="margin: 8px 0 0 0; font-size: 13px; font-style: italic; opacity: 0.9;">"${gc.message}"</p>
          ` : ''}
        </div>
      ` : ''}
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Tus Gift Cards de TELAR</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        
        <!-- Header -->
        <div style="background: #142239; padding: 32px; text-align: center;">
          <img src="https://ylooqmqmoufqtxvetxuj.supabase.co/storage/v1/object/public/site-assets/logo-horizontal.svg" alt="TELAR" style="height: 48px;" />
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 32px;">
          <h1 style="margin: 0 0 8px 0; font-size: 28px; color: #142239;">🎉 ¡Gracias por tu compra!</h1>
          <p style="margin: 0 0 24px 0; font-size: 16px; color: #666;">
            Tu pedido <strong style="color: #142239;">#${orderId}</strong> ha sido procesado exitosamente.
          </p>
          
          <!-- Summary -->
          <div style="background: #fcf7ec; border-radius: 12px; padding: 20px; margin-bottom: 32px; border-left: 4px solid #ffc716;">
            <p style="margin: 0; font-size: 14px; color: #666;">Resumen de tu compra</p>
            <p style="margin: 8px 0 0 0; font-size: 20px; font-weight: bold; color: #142239;">
              ${giftCards.length} Gift Card${giftCards.length > 1 ? 's' : ''} • Total: ${formatCOP(totalAmount)}
            </p>
          </div>
          
          <h2 style="margin: 0 0 20px 0; font-size: 18px; color: #142239;">Tus Gift Cards</h2>
          
          <!-- Gift Card Cards -->
          ${giftCardCardsHtml}
          
          <!-- Instructions -->
          <div style="background: #f8f9fa; border-radius: 12px; padding: 24px; margin-top: 32px;">
            <h3 style="margin: 0 0 16px 0; font-size: 16px; color: #142239;">📋 Cómo usar tus Gift Cards</h3>
            <ol style="margin: 0; padding-left: 20px; color: #666; font-size: 14px; line-height: 1.8;">
              <li>Visita <a href="https://telar.co" style="color: #142239; font-weight: bold;">telar.co</a> y explora las artesanías colombianas</li>
              <li>Agrega productos a tu carrito</li>
              <li>En el checkout, ingresa el código de tu Gift Card</li>
              <li>El saldo se aplicará automáticamente a tu compra</li>
            </ol>
            <p style="margin: 16px 0 0 0; font-size: 13px; color: #999;">
              💡 Puedes usar múltiples gift cards en una sola compra. El saldo restante quedará disponible para futuras compras.
            </p>
          </div>
          
          <!-- CTA Button -->
          <div style="text-align: center; margin-top: 32px;">
            <a href="https://telar.co" style="display: inline-block; background: #ffc716; color: #142239; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
              Explorar Artesanías
            </a>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #142239; padding: 32px; text-align: center;">
          <p style="margin: 0 0 8px 0; font-size: 14px; color: rgba(255,255,255,0.9);">
            Artesanías auténticas de Colombia 🇨🇴
          </p>
          <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.6);">
            ¿Preguntas? Escríbenos a <a href="mailto:hola@telar.co" style="color: #ffc716;">hola@telar.co</a>
          </p>
          <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1);">
            <p style="margin: 0; font-size: 11px; color: rgba(255,255,255,0.4);">
              © ${new Date().getFullYear()} TELAR. Todos los derechos reservados.
            </p>
          </div>
        </div>
        
      </div>
    </body>
    </html>
  `;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    const { order_id, purchaser_email, gift_cards } = await req.json();

    if (!order_id || !purchaser_email || !gift_cards || !Array.isArray(gift_cards)) {
      return new Response(JSON.stringify({
        success: false,
        error: "Datos incompletos"
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    const generatedCards: Array<{
      code: string;
      amount: number;
      recipient_email: string | null;
      expiration_date: string | null;
      message?: string | null;
    }> = [];

    for (const item of gift_cards) {
      const { amount, quantity = 1, recipient_email, message, expiration_days } = item;

      for (let i = 0; i < quantity; i++) {
        // Generate unique code
        let code = generateGiftCardCode();
        let attempts = 0;
        while (attempts < 10) {
          const { data: existing } = await supabase.from("gift_cards").select("id").eq("code", code).single();
          if (!existing) break;
          code = generateGiftCardCode();
          attempts++;
        }

        // Calculate expiration date
        let expirationDate: string | null = null;
        if (expiration_days) {
          const expDate = new Date();
          expDate.setDate(expDate.getDate() + expiration_days);
          expirationDate = expDate.toISOString();
        }

        // Insert gift card
        const { data: newCard, error } = await supabase.from("gift_cards").insert({
          code,
          initial_amount: amount,
          remaining_amount: amount,
          currency: "COP",
          status: "active",
          expiration_date: expirationDate,
          purchaser_email,
          recipient_email: recipient_email || null,
          message: message || null,
          marketplace_order_id: order_id
        }).select().single();

        if (error) {
          console.error("Error creating gift card:", error);
          continue;
        }

        generatedCards.push({
          code: newCard.code,
          amount: newCard.initial_amount,
          recipient_email: newCard.recipient_email,
          expiration_date: newCard.expiration_date,
          message: newCard.message
        });

        console.log(`✅ Gift card created: ${code} for ${formatCOP(amount)}`);
      }
    }

    // Send email to purchaser with gift card codes
    if (generatedCards.length > 0) {
      try {
        console.log(`📧 Enviando email de gift cards a ${purchaser_email}...`);
        
        const emailHtml = generateGiftCardEmailHtml(order_id, generatedCards);
        
        const { data: emailData, error: emailError } = await resend.emails.send({
          from: "TELAR <hola@updates.telar.co>",
          to: [purchaser_email],
          subject: `🎁 ${generatedCards.length === 1 ? 'Tu Gift Card' : `Tus ${generatedCards.length} Gift Cards`} de TELAR`,
          html: emailHtml
        });
        
        if (emailError) {
          console.error('❌ Error enviando email de gift cards:', emailError);
        } else {
          console.log('✅ Email de gift cards enviado:', emailData?.id);
        }
      } catch (emailErr) {
        console.error('❌ Error inesperado enviando email:', emailErr);
        // No fail the response due to email error
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `${generatedCards.length} gift card(s) generadas exitosamente`,
      gift_cards: generatedCards
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Error generating gift cards:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Error al generar gift cards"
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
