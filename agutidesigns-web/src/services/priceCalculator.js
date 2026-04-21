/* =============================================
   AGUTIDESIGNS - Calculadora de Precios
   ============================================= */

const WEB_BASE_PRICES = {
  landing: 497,
  corporativa: 997,
  ecommerce: 1497,
  portfolio: 697,
  blog: 597,
  webapp: 1997,
  otra: 997,
};

// Páginas incluidas por tipo de web:
//   landing     → 1 página (fijo)
//   corporativa → hasta 10 páginas incluidas → sólo cobra 10+
//   portfolio   → hasta 5 páginas incluidas
//   blog/otra   → hasta 5 páginas incluidas
//   webapp      → no aplica igual
const PAGE_EXTRA_BY_TYPE = {
  landing:     { '1': 0, '1-3': 0,   '3-5': 0,   '5-10': 0,   '10+': 0,    'no-se': 0   },
  corporativa: { '1': 0, '1-3': 0,   '3-5': 0,   '5-10': 0,   '10+': 350,  'no-se': 0   },
  portfolio:   { '1': 0, '1-3': 0,   '3-5': 0,   '5-10': 150, '10+': 350,  'no-se': 0   },
  blog:        { '1': 0, '1-3': 0,   '3-5': 0,   '5-10': 150, '10+': 350,  'no-se': 0   },
  ecommerce:   { '1': 0, '1-3': 0,   '3-5': 0,   '5-10': 0,   '10+': 0,    'no-se': 0   },
  webapp:      { '1': 0, '1-3': 0,   '3-5': 150, '5-10': 300, '10+': 600,  'no-se': 150 },
  otra:        { '1': 0, '1-3': 0,   '3-5': 150, '5-10': 300, '10+': 550,  'no-se': 150 },
};
// Fallback legacy (no debería usarse)
const PAGE_EXTRA = { '1': 0, '1-3': 0, '3-5': 150, '5-10': 300, '10+': 550, 'no-se': 150 };

// Extra por número de productos en tienda online
const PRODUCT_COUNT_EXTRA = {
  '1-50':   0,     // incluido en el base
  '50-200': 200,
  '200-500': 450,
  '500+':   850,
};

const AI_FEATURE_PRICES = {
  'chatbot-web': 250,
  'chatbot': 250,
  'chatbot-wa': 350,
  'emails': 200,
  'seo': 250,
  'analytics': 200,
  'presupuestos': 300,
  'quotes': 300,
  'crm': 250,
  'content': 200,
  'translations': 150,
};

const EXTRA_FEATURE_PRICE = 120;

const TIMELINE_MULTIPLIER = {
  urgente: 1.25,
  normal: 1,
  flexible: 0.95,
  'sin-prisa': 0.9,
};

const MONTHLY_BASE = {
  landing: 35,
  corporativa: 55,
  ecommerce: 75,
  portfolio: 45,
  blog: 45,
  webapp: 95,
  otra: 55,
};

const AI_MONTHLY_EXTRA = 15;

export function calculatePrice(formData) {
  const webBase = WEB_BASE_PRICES[formData.webType] || 997;
  const pageTable = PAGE_EXTRA_BY_TYPE[formData.webType] || PAGE_EXTRA;
  const pagesExtra = pageTable[formData.pages] ?? 0;

  // Extra por productos (solo ecommerce)
  const productExtra = formData.webType === 'ecommerce'
    ? (PRODUCT_COUNT_EXTRA[formData.productCount] || 0)
    : 0;

  const aiFeatures = formData.aiFeatures || [];
  const aiTotal = aiFeatures.reduce((sum, f) => sum + (AI_FEATURE_PRICES[f] || 150), 0);

  const extras = formData.extraFeatures || [];
  const extrasTotal = extras.length * EXTRA_FEATURE_PRICE;

  const subtotal = webBase + pagesExtra + productExtra + aiTotal + extrasTotal;

  const multiplier = TIMELINE_MULTIPLIER[formData.timeline] || 1;
  const total = Math.round(subtotal * multiplier);

  const monthlyBase = MONTHLY_BASE[formData.webType] || 55;
  const monthlyAi = aiFeatures.length * AI_MONTHLY_EXTRA;
  const monthly = monthlyBase + monthlyAi;

  const breakdown = [];
  breakdown.push({ label: `Diseño web (${formData.webType || 'estándar'})`, price: webBase });
  if (pagesExtra > 0) breakdown.push({ label: `Páginas extra (${formData.pages} págs.)`, price: pagesExtra });
  if (productExtra > 0) {
    const productLabels = {
      '50-200': '50–200 productos',
      '200-500': '200–500 productos',
      '500+': 'Más de 500 productos',
    };
    breakdown.push({ label: `Catálogo: ${productLabels[formData.productCount] || formData.productCount}`, price: productExtra });
  }
  aiFeatures.forEach(f => {
    const names = {
      'chatbot-web': 'Chatbot IA web',
      'chatbot': 'Chatbot IA web',
      'chatbot-wa': 'WhatsApp IA',
      'emails': 'Automatización emails',
      'seo': 'SEO con IA',
      'analytics': 'Dashboard analytics',
      'presupuestos': 'Presupuestos automáticos',
      'quotes': 'Presupuestos automáticos',
      'crm': 'CRM inteligente',
      'content': 'Generación de contenido',
      'translations': 'Traducciones automáticas',
    };
    breakdown.push({ label: names[f] || f, price: AI_FEATURE_PRICES[f] || 150 });
  });
  if (extrasTotal > 0) breakdown.push({ label: `${extras.length} funcionalidades extra`, price: extrasTotal });
  if (multiplier !== 1) {
    const diff = total - subtotal;
    breakdown.push({ label: multiplier > 1 ? 'Recargo urgencia' : 'Descuento flexibilidad', price: diff });
  }

  return { total, monthly, breakdown, webBase, aiTotal, extrasTotal, productExtra };
}

export function formatPrice(n) {
  return n.toLocaleString('es-ES');
}
