/**
 * Los dos canales por los que empieza una venta hoy: una conversación.
 * Costear se adapta a cada empresa, así que la landing no vende un plan:
 * invita a hablar. Son los mismos datos que ya publicaba el pie de la landing.
 */
export const EMAIL_CONTACTO = 'proyectocostear@gmail.com';

const WHATSAPP = '5493816580360';
const MENSAJE_INICIAL = 'Hola, quiero saber si Costear sirve para mi negocio.';

export const WHATSAPP_URL = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(MENSAJE_INICIAL)}`;
export const EMAIL_URL = `mailto:${EMAIL_CONTACTO}?subject=${encodeURIComponent('Quiero conocer Costear')}`;
