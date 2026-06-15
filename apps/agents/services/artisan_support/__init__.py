"""
Artisan Support WhatsApp bot — RAG-based tutor for artisan training materials.

Separate from services/whatsapp/ (the sales/marketplace bot): different
WhatsApp number, credentials, and webhook endpoint, but reuses the generic
WebhookHandler, transcription service, and conversation memory patterns.
"""
