import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import {
  CheckCircle, ChevronRight, ChevronLeft, Send,
  Upload, X, Image as ImageIcon, Loader,
} from 'lucide-react';
import './Cliente.css';

/* ============================================
   DEFINICIÓN DE BRIEFINGS POR TIPO DE WEB
   ============================================ */
const BRIEFINGS = {
  landing: {
    label: 'Landing Page',
    steps: [
      {
        id: 'negocio',
        title: '¿A qué te dedicas?',
        sub: 'Cuéntame sobre tu negocio y el objetivo principal de la landing.',
        fields: [
          { key: 'company_name',        label: 'Nombre de tu negocio o proyecto *', placeholder: 'Ej. Hello Nails Barcelona' },
          { key: 'company_description', label: '¿Qué haces exactamente?', multiline: true, placeholder: 'Describe tu negocio en 2-3 frases. ¿Qué vendes? ¿A quién? ¿Qué te diferencia?' },
          { key: 'sector',              label: 'Sector / industria', placeholder: 'Ej. Estética, Hostelería, Consultoría...' },
        ],
      },
      {
        id: 'objetivo',
        title: 'Objetivo de la landing',
        sub: '¿Qué quieres que haga el visitante cuando llegue a tu web?',
        fields: [
          { key: 'main_cta',         label: 'Acción principal (CTA) *', placeholder: 'Ej. Reservar una cita / Descargar guía gratis / Contactar / Comprar producto' },
          { key: 'target_audience',  label: '¿A quién va dirigida?', multiline: true, placeholder: 'Ej. Mujeres de 25-40 años que buscan tratamientos de estética premium en Barcelona' },
          { key: 'customer_pain',    label: '¿Qué problema les resuelves?', multiline: true, placeholder: 'Ej. No encuentran un centro de confianza cerca con reservas online y atención personalizada' },
          { key: 'unique_value',     label: '¿Por qué deberían elegirte a ti?', multiline: true, placeholder: 'Tu propuesta de valor única. ¿Qué tienes que no tiene la competencia?' },
        ],
      },
      {
        id: 'marca',
        title: 'Marca y estilo',
        sub: 'Así podré diseñar algo que encaje con tu imagen.',
        fields: [
          { key: 'brand_colors',  label: 'Colores de tu marca', placeholder: 'Ej. Azul marino #1A2E5A y dorado #C9A84C' },
          { key: 'typography',   label: 'Tipografía (si tienes)', placeholder: 'Ej. Playfair Display para títulos, Inter para cuerpo' },
          { key: 'tone',         label: 'Tono de comunicación', placeholder: 'Ej. Cercano y profesional, sin demasiada formalidad' },
          { key: 'logo_url',     label: 'Link a tu logo (Drive, Dropbox...)', placeholder: 'https://drive.google.com/...' },
        ],
      },
      {
        id: 'referencias',
        title: 'Referencias visuales',
        sub: 'Muéstrame webs que te gusten y sube imágenes de inspiración.',
        fields: [
          { key: 'reference_sites',  label: 'Webs que te gustan (pon los links)', multiline: true, placeholder: 'https://ejemplo.com — me gusta su limpieza\nhttps://otro.com — me encanta el hero' },
          { key: 'style_likes',      label: '¿Qué te gusta de esas webs?', multiline: true, placeholder: 'Ej. Fondos claros, tipografía grande, fotos de calidad...' },
          { key: 'style_dislikes',   label: '¿Qué NO quieres en tu web?', multiline: true, placeholder: 'Ej. Sin colores chillones, nada de animaciones excesivas...' },
        ],
        hasImageUpload: true,
        imageLabel: 'Sube imágenes de inspiración, tu logo, fotos de tu negocio...',
      },
      {
        id: 'contacto',
        title: 'Datos de contacto y extras',
        sub: 'Para incluirlos en la landing y poder contactarte yo a ti.',
        fields: [
          { key: 'phone',             label: 'Teléfono de contacto', placeholder: '+34 600 000 000' },
          { key: 'address',           label: 'Dirección física (si la hay)', placeholder: 'Calle Mayor 10, Barcelona' },
          { key: 'social_links',      label: 'Redes sociales', placeholder: '@instagram, LinkedIn, TikTok...' },
          { key: 'competitors',       label: 'Competidores principales', placeholder: 'Ej. https://competidor.com' },
          { key: 'additional_notes',  label: 'Notas finales o requisitos especiales', multiline: true, placeholder: 'Cualquier cosa que deba saber: plazos, integraciones, ideas...' },
        ],
      },
    ],
  },

  corporativa: {
    label: 'Web Corporativa',
    steps: [
      {
        id: 'empresa',
        title: 'Tu empresa',
        sub: 'Necesito conocer bien tu empresa para reflejarla en la web.',
        fields: [
          { key: 'company_name',        label: 'Nombre de la empresa *', placeholder: 'Ej. Consultoría López & Asociados' },
          { key: 'company_description', label: '¿A qué se dedica tu empresa?', multiline: true, placeholder: 'Describe brevemente tu empresa, qué hace y qué la diferencia de la competencia' },
          { key: 'sector',              label: 'Sector / industria', placeholder: 'Ej. Consultoría legal, Arquitectura, Ingeniería...' },
          { key: 'founded_year',        label: 'Año de fundación', placeholder: 'Ej. 2012' },
          { key: 'team_size',           label: 'Tamaño del equipo', placeholder: 'Ej. 5 personas / 20 empleados' },
          { key: 'logo_url',            label: 'Link a tu logo (Drive, Dropbox...)', placeholder: 'https://drive.google.com/...' },
        ],
      },
      {
        id: 'audiencia',
        title: 'Público objetivo',
        sub: 'Cuanto más específico seas, mejor podré enfocar el diseño y los textos.',
        fields: [
          { key: 'target_audience', label: '¿Quién es tu cliente ideal?', multiline: true, placeholder: 'Ej. Empresas medianas del sector industrial que necesitan asesoría legal especializada' },
          { key: 'customer_pain',   label: '¿Qué problema les resuelves?', multiline: true, placeholder: 'Ej. Necesitan un partner legal de confianza que les asesore en contratos internacionales' },
          { key: 'unique_value',    label: '¿Por qué deberían elegirte a ti?', multiline: true, placeholder: 'Tu propuesta de valor. ¿Qué tienes que no tiene la competencia?' },
        ],
      },
      {
        id: 'servicios',
        title: 'Servicios y equipo',
        sub: 'Dime qué ofreces y quién hay detrás de la empresa.',
        fields: [
          { key: 'services_list',   label: 'Lista de servicios que ofreces *', multiline: true, rows: 5, placeholder: 'Servicio 1: Nombre — descripción breve\nServicio 2: Nombre — descripción breve\n...' },
          { key: 'team_members',    label: 'Miembros del equipo a mostrar (si aplica)', multiline: true, placeholder: 'Nombre — cargo — bio breve\nEj. María García — Socia fundadora — 15 años de experiencia en...' },
          { key: 'awards',          label: 'Premios, certificaciones o hitos destacados', multiline: true, placeholder: 'Ej. Premio PYME Innovadora 2023, Certificado ISO 9001...' },
        ],
      },
      {
        id: 'paginas',
        title: 'Páginas y contenido',
        sub: 'Dime qué páginas quieres y qué debe decir cada una.',
        fields: [
          { key: 'pages_content',  label: 'Páginas que quieres en tu web *', multiline: true, rows: 6, placeholder: 'Inicio: presentación + servicios destacados + CTA\nSobre nosotros: historia, valores, equipo\nServicios: detalle de cada servicio\nClientes/Proyectos: casos de éxito\nBlog: artículos del sector\nContacto: formulario + mapa' },
          { key: 'key_messages',   label: 'Mensajes clave que quieres transmitir', multiline: true, placeholder: 'Ej. Somos el despacho de referencia en el sector. Más de 200 clientes satisfechos. Respuesta en 24h garantizada.' },
          { key: 'testimonials',   label: 'Testimonios de clientes (si tienes)', multiline: true, placeholder: '"Trabajar con ellos fue una experiencia excelente..." — Juan García, CEO de Empresa X' },
        ],
      },
      {
        id: 'marca',
        title: 'Marca y estilo visual',
        sub: 'Para que el diseño refleje perfectamente tu identidad de marca.',
        fields: [
          { key: 'brand_colors',   label: 'Colores corporativos', placeholder: 'Ej. Azul marino #1A2E5A, gris #6B7280, blanco' },
          { key: 'typography',    label: 'Tipografía (si tienes)', placeholder: 'Ej. Helvetica Neue para títulos' },
          { key: 'tone',          label: 'Tono de comunicación', placeholder: 'Ej. Formal y cercano, transmitir confianza y experiencia' },
        ],
      },
      {
        id: 'referencias',
        title: 'Referencias visuales',
        sub: 'Muéstrame webs de referencia y sube imágenes de tu empresa.',
        fields: [
          { key: 'reference_sites',  label: 'Webs que te gustan (con links)', multiline: true, placeholder: 'https://ejemplo.com — me gusta su sobriedad\nhttps://otro.com — buena estructura de servicios' },
          { key: 'style_likes',      label: '¿Qué te gusta de esas webs?', multiline: true, placeholder: 'Ej. Diseño limpio, mucho espacio en blanco, fotografías profesionales...' },
          { key: 'style_dislikes',   label: '¿Qué NO quieres?', multiline: true, placeholder: 'Ej. Sin fondos oscuros, nada de animaciones excesivas...' },
          { key: 'competitors',      label: 'Webs de la competencia', placeholder: 'https://competidor1.com, https://competidor2.com' },
        ],
        hasImageUpload: true,
        imageLabel: 'Sube fotos de tu empresa, equipo, oficina, logo, materiales de marca...',
      },
      {
        id: 'contacto',
        title: 'Datos de contacto y extras',
        sub: 'Información de contacto para la web y notas finales.',
        fields: [
          { key: 'phone',             label: 'Teléfono', placeholder: '+34 91 000 00 00' },
          { key: 'address',           label: 'Dirección', placeholder: 'Calle Gran Vía 28, Madrid' },
          { key: 'social_links',      label: 'Redes sociales (LinkedIn, Instagram...)', placeholder: 'LinkedIn: /empresa, Instagram: @empresa' },
          { key: 'additional_notes',  label: 'Notas finales o requisitos especiales', multiline: true, placeholder: 'Cualquier integración, herramienta o requisito técnico...' },
        ],
      },
    ],
  },

  ecommerce: {
    label: 'Tienda Online',
    steps: [
      {
        id: 'tienda',
        title: 'Tu tienda',
        sub: 'Cuéntame sobre lo que vendes y quién lo compra.',
        fields: [
          { key: 'company_name',        label: 'Nombre de tu tienda *', placeholder: 'Ej. Artesanía Gala' },
          { key: 'company_description', label: '¿Qué vendes exactamente?', multiline: true, placeholder: 'Describe tus productos: categorías, materiales, precios orientativos...' },
          { key: 'sector',              label: 'Categoría principal de productos', placeholder: 'Ej. Moda, Alimentación, Hogar, Tecnología...' },
          { key: 'target_audience',     label: '¿A quién van dirigidos tus productos?', multiline: true, placeholder: 'Ej. Mujeres de 30-50 años interesadas en decoración artesanal sostenible' },
          { key: 'unique_value',        label: '¿Por qué comprar en tu tienda y no en Amazon?', multiline: true, placeholder: 'Tu propuesta de valor diferencial' },
          { key: 'logo_url',            label: 'Link a tu logo', placeholder: 'https://drive.google.com/...' },
        ],
      },
      {
        id: 'catalogo',
        title: 'Catálogo de productos',
        sub: 'Necesito entender bien tu catálogo para estructurar la tienda.',
        fields: [
          { key: 'product_categories', label: 'Categorías de productos *', multiline: true, placeholder: 'Ej.\nCategoría 1: Cerámica artesanal (20 productos)\nCategoría 2: Textiles (35 productos)\nCategoría 3: Accesorios (15 productos)' },
          { key: 'price_range',        label: 'Rango de precios', placeholder: 'Ej. Desde 15€ hasta 250€' },
          { key: 'product_variations', label: '¿Tus productos tienen variaciones? (tallas, colores...)', multiline: true, placeholder: 'Ej. Las camisetas vienen en S, M, L, XL y en 5 colores diferentes' },
          { key: 'stock_info',         label: '¿Tienes un sistema de gestión de stock?', placeholder: 'Ej. Holded, Shopify, Excel propio, no tengo...' },
        ],
      },
      {
        id: 'logistica',
        title: 'Logística, envíos y pagos',
        sub: 'Esta información es clave para configurar correctamente la tienda.',
        fields: [
          { key: 'shipping_info',   label: 'Política de envíos *', multiline: true, placeholder: 'Ej. Envío gratis +50€. Península 3-5 días (4,99€). Internacional 7-10 días (12€). Envío express disponible.' },
          { key: 'return_policy',   label: 'Política de devoluciones', multiline: true, placeholder: 'Ej. 30 días para devoluciones. Producto en perfecto estado. Gastos de devolución a cargo del cliente.' },
          { key: 'payment_methods', label: '¿Qué métodos de pago quieres aceptar?', multiline: true, placeholder: 'Ej. Tarjeta de crédito/débito, PayPal, Bizum, Transferencia bancaria' },
          { key: 'payment_gateway', label: '¿Tienes cuenta en Stripe, PayPal u otro TPV?', placeholder: 'Ej. Sí, tengo cuenta en Stripe / No tengo, necesito ayuda' },
        ],
      },
      {
        id: 'marca',
        title: 'Marca y estilo visual',
        sub: 'La identidad visual de tu tienda es fundamental para vender.',
        fields: [
          { key: 'brand_colors',  label: 'Colores de tu marca', placeholder: 'Ej. Terracota #C2714F, beige #F5F0E8, negro' },
          { key: 'typography',   label: 'Tipografía (si tienes)', placeholder: 'Ej. Playfair Display para títulos' },
          { key: 'tone',         label: 'Tono de comunicación', placeholder: 'Ej. Cálido, artesanal, cercano, sostenible' },
        ],
      },
      {
        id: 'referencias',
        title: 'Referencias y fotos de productos',
        sub: 'Muéstrame tiendas de referencia y sube fotos de tus productos.',
        fields: [
          { key: 'reference_sites',  label: 'Tiendas online que te gustan', multiline: true, placeholder: 'https://ejemplo.com — me gusta su página de producto\nhttps://otro.com — checkout muy limpio' },
          { key: 'style_likes',      label: '¿Qué te gusta de esas tiendas?', multiline: true, placeholder: 'Ej. Fotos grandes, fichas de producto detalladas, proceso de compra sencillo...' },
          { key: 'competitors',      label: 'Tiendas de la competencia', placeholder: 'https://competidor.com' },
        ],
        hasImageUpload: true,
        imageLabel: 'Sube fotos de tus productos, logo, packaging, fotos de lifestyle...',
      },
      {
        id: 'extras',
        title: 'Funcionalidades y extras',
        sub: 'Cuéntame si necesitas algo más allá de la tienda básica.',
        fields: [
          { key: 'extra_features',    label: '¿Necesitas alguna funcionalidad especial?', multiline: true, placeholder: 'Ej. Sistema de puntos/fidelización, suscripciones, productos personalizables, blog...' },
          { key: 'social_links',      label: 'Redes sociales', placeholder: '@instagram, TikTok, Pinterest...' },
          { key: 'address',           label: '¿Tienes tienda física también?', placeholder: 'Calle Mayor 10, Barcelona (o "Solo online")' },
          { key: 'additional_notes',  label: 'Notas finales', multiline: true, placeholder: 'Cualquier requisito especial, integración, o información importante...' },
        ],
      },
    ],
  },

  portfolio: {
    label: 'Portfolio',
    steps: [
      {
        id: 'perfil',
        title: 'Tu perfil profesional',
        sub: 'El portfolio es tu carta de presentación. Cuéntame quién eres.',
        fields: [
          { key: 'company_name',        label: 'Tu nombre o marca personal *', placeholder: 'Ej. Carlos López | Fotografía' },
          { key: 'company_description', label: '¿Qué haces profesionalmente?', multiline: true, placeholder: 'Ej. Fotógrafo de moda y editorial con 8 años de experiencia. He trabajado con marcas como...' },
          { key: 'sector',              label: 'Especialidad / disciplina', placeholder: 'Ej. Fotografía de moda, Arquitectura, Diseño gráfico, Ilustración...' },
          { key: 'target_audience',     label: '¿A quién va dirigido tu portfolio?', multiline: true, placeholder: 'Ej. Directores de arte de agencias de publicidad y marcas de moda premium' },
          { key: 'unique_value',        label: '¿Qué te diferencia de otros profesionales?', multiline: true, placeholder: 'Tu sello personal, tu forma de trabajar, tu experiencia única...' },
          { key: 'logo_url',            label: 'Link a tu logo o avatar (si tienes)', placeholder: 'https://drive.google.com/...' },
        ],
      },
      {
        id: 'trabajos',
        title: 'Tus trabajos y proyectos',
        sub: 'Dime qué proyectos quieres mostrar y cómo organizarlos.',
        fields: [
          { key: 'projects_list',   label: 'Proyectos a mostrar *', multiline: true, rows: 6, placeholder: 'Proyecto 1: Campaña Zara SS24 — Fotografía editorial — Año 2024\nProyecto 2: Lookbook H&M — Fotografía producto — Año 2023\n...' },
          { key: 'project_categories', label: 'Categorías para organizar el trabajo', placeholder: 'Ej. Editorial / Campaña / Producto / Retrato' },
          { key: 'awards',          label: 'Premios, menciones o publicaciones destacadas', multiline: true, placeholder: 'Ej. Publicado en Vogue España, Premio Mejor Fotógrafo Joven 2023...' },
        ],
      },
      {
        id: 'servicios',
        title: 'Servicios que ofreces',
        sub: 'Lo que quieres contratar a través de tu portfolio.',
        fields: [
          { key: 'services_list',  label: 'Servicios y precios orientativos', multiline: true, rows: 5, placeholder: 'Sesión editorial: desde 800€\nCampaña de producto: desde 1.200€\nRetrato corporativo: desde 300€' },
          { key: 'process_info',   label: 'Tu proceso de trabajo', multiline: true, placeholder: 'Ej. 1. Briefing inicial → 2. Propuesta creativa → 3. Sesión → 4. Entrega de selección → 5. Post-producción' },
        ],
      },
      {
        id: 'marca',
        title: 'Estilo visual y marca personal',
        sub: 'Tu portfolio debe ser tan impactante como tu trabajo.',
        fields: [
          { key: 'brand_colors',  label: 'Paleta de colores', placeholder: 'Ej. Negro, blanco y un toque de oro' },
          { key: 'typography',   label: 'Tipografía preferida', placeholder: 'Ej. Serif elegante para el nombre, sans-serif para el resto' },
          { key: 'tone',         label: 'Tono y personalidad del portfolio', placeholder: 'Ej. Minimalista, artístico, impactante. Que el trabajo hable por sí solo.' },
        ],
      },
      {
        id: 'referencias',
        title: 'Referencias y galería de trabajos',
        sub: 'Sube tus mejores trabajos y muéstrame portfolios de referencia.',
        fields: [
          { key: 'reference_sites', label: 'Portfolios que te gustan (links)', multiline: true, placeholder: 'https://ejemplo.com — me gusta su minimalismo\nhttps://otro.com — navegación muy limpia' },
          { key: 'style_likes',     label: '¿Qué te gusta de esos portfolios?', multiline: true, placeholder: 'Ej. Galerías grandes, pocas distracciones, sobre mí muy visual...' },
        ],
        hasImageUpload: true,
        imageLabel: 'Sube tus mejores trabajos, foto tuya, logo... (los mejores primero)',
      },
      {
        id: 'contacto',
        title: 'Contacto y extras',
        sub: 'Cómo quieres que te contacten tus futuros clientes.',
        fields: [
          { key: 'phone',             label: 'Teléfono / WhatsApp', placeholder: '+34 600 000 000' },
          { key: 'address',           label: 'Ciudad donde trabajas', placeholder: 'Ej. Barcelona (disponible para viajar)' },
          { key: 'social_links',      label: 'Redes sociales', placeholder: '@instagram, Behance, LinkedIn...' },
          { key: 'additional_notes',  label: 'Notas finales', multiline: true, placeholder: 'Cualquier idea, requisito o información adicional...' },
        ],
      },
    ],
  },

  webapp: {
    label: 'Aplicación Web',
    steps: [
      {
        id: 'producto',
        title: 'El producto / servicio',
        sub: 'Cuéntame qué hace tu aplicación y el problema que resuelve.',
        fields: [
          { key: 'company_name',        label: 'Nombre del producto o empresa *', placeholder: 'Ej. TaskFlow SaaS' },
          { key: 'company_description', label: '¿Qué hace exactamente tu aplicación?', multiline: true, placeholder: 'Describe el producto: qué problema resuelve, cómo funciona, cuál es su valor principal' },
          { key: 'sector',              label: 'Sector / mercado', placeholder: 'Ej. B2B SaaS, Fintech, Healthtech, Marketplace...' },
          { key: 'target_audience',     label: '¿Quiénes son tus usuarios?', multiline: true, placeholder: 'Ej. Equipos de marketing de empresas medianas (50-500 empleados) que necesitan automatizar reportes' },
          { key: 'unique_value',        label: '¿Por qué tu producto y no la competencia?', multiline: true, placeholder: 'Tu ventaja competitiva principal' },
        ],
      },
      {
        id: 'funcionalidades',
        title: 'Funcionalidades principales',
        sub: 'Lista las funciones clave que quieres mostrar en la web.',
        fields: [
          { key: 'features_list',    label: 'Funcionalidades principales *', multiline: true, rows: 6, placeholder: 'Feature 1: Dashboard en tiempo real — descripción\nFeature 2: Automatización de reportes — descripción\nFeature 3: Integración con Slack — descripción\n...' },
          { key: 'pricing_model',    label: 'Modelo de precios', multiline: true, placeholder: 'Ej. Free: 0€/mes (hasta 3 proyectos)\nPro: 29€/mes (ilimitado)\nEnterprise: precio personalizado' },
          { key: 'integrations',     label: 'Integraciones con otras herramientas', placeholder: 'Ej. Slack, Notion, HubSpot, Zapier, API propia...' },
        ],
      },
      {
        id: 'contenido',
        title: 'Páginas y contenido de la web',
        sub: 'Qué secciones quieres en la web que presenta tu app.',
        fields: [
          { key: 'pages_content',  label: 'Secciones que quieres en la web *', multiline: true, rows: 6, placeholder: 'Hero: propuesta de valor + CTA a prueba gratuita\nFeatures: 3-6 funciones principales\nPricing: tabla de precios\nTestimonios: clientes que lo usan\nFAQ: preguntas frecuentes\nBlog: artículos del sector' },
          { key: 'key_messages',   label: 'Mensajes clave', multiline: true, placeholder: 'Ej. Ahorra 5 horas a la semana. Sin instalación. Prueba gratis 14 días sin tarjeta.' },
          { key: 'testimonials',   label: 'Testimonios de usuarios', multiline: true, placeholder: '"Desde que usamos TaskFlow ahorramos 3 horas al día" — Ana López, CMO en Empresa X' },
        ],
      },
      {
        id: 'marca',
        title: 'Identidad visual',
        sub: 'El diseño de una webapp debe transmitir confianza y modernidad.',
        fields: [
          { key: 'brand_colors',  label: 'Paleta de colores', placeholder: 'Ej. Azul #0047FF como primario, fondo oscuro #0D1117' },
          { key: 'typography',   label: 'Tipografía', placeholder: 'Ej. Inter para todo el producto (ya lo uso en la app)' },
          { key: 'tone',         label: 'Tono de comunicación', placeholder: 'Ej. Técnico pero accesible, orientado a resultados, directo' },
          { key: 'logo_url',     label: 'Link a tu logo', placeholder: 'https://drive.google.com/...' },
        ],
      },
      {
        id: 'referencias',
        title: 'Referencias visuales',
        sub: 'Webs de SaaS que te gusten y capturas de tu app.',
        fields: [
          { key: 'reference_sites', label: 'Webs de SaaS de referencia', multiline: true, placeholder: 'https://linear.app — me gusta su precisión visual\nhttps://vercel.com — hero muy impactante' },
          { key: 'style_likes',     label: '¿Qué te gusta de esas webs?', multiline: true, placeholder: 'Ej. Dark mode, tipografía bold, screenshots grandes de la app...' },
          { key: 'competitors',     label: 'Competidores directos', placeholder: 'https://competidor1.com, https://competidor2.com' },
        ],
        hasImageUpload: true,
        imageLabel: 'Sube capturas de pantalla de tu app, logo, mockups, flujos de usuario...',
      },
      {
        id: 'tecnico',
        title: 'Aspectos técnicos y extras',
        sub: 'Información técnica relevante para el desarrollo.',
        fields: [
          { key: 'tech_stack',        label: '¿Con qué tecnologías está construida tu app?', placeholder: 'Ej. React + Node.js + PostgreSQL en AWS' },
          { key: 'extra_features',    label: '¿Necesitas algo especial en la web?', multiline: true, placeholder: 'Ej. Demo interactiva embebida, vídeo demo autoplay, integración con tu dashboard...' },
          { key: 'social_links',      label: 'Redes sociales / comunidad', placeholder: 'Twitter/X, LinkedIn, Discord...' },
          { key: 'additional_notes',  label: 'Notas finales', multiline: true, placeholder: 'Cualquier requisito técnico, plazo o información adicional...' },
        ],
      },
    ],
  },
};

// Fallback genérico
const GENERIC_BRIEFING = BRIEFINGS.corporativa;

function getBriefing(webType) {
  const key = webType?.toLowerCase();
  return BRIEFINGS[key] || GENERIC_BRIEFING;
}

/* ============================================
   COMPONENTE PRINCIPAL
   ============================================ */
export default function ClienteBriefing() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const quoteId = params.get('quote');

  const [step, setStep]           = useState(0);
  const [form, setForm]           = useState({});
  const [images, setImages]       = useState([]);
  const [quote, setQuote]         = useState(null);
  const [saving, setSaving]       = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [existingId, setExistingId] = useState(null);
  const [briefingDef, setBriefingDef] = useState(null);

  useEffect(() => {
    if (!quoteId) return;
    supabase.from('quotes').select('*').eq('id', quoteId).single()
      .then(({ data }) => {
        setQuote(data);
        setBriefingDef(getBriefing(data?.web_type));
      });
    supabase.from('briefings').select('*').eq('quote_id', quoteId).maybeSingle()
      .then(({ data }) => {
        if (data) {
          setForm(data);
          setImages(data.image_urls || []);
          setExistingId(data.id);
          if (data.status === 'submitted') setSubmitted(true);
        }
      });
  }, [quoteId]);

  if (!briefingDef) {
    return (
      <div className="cli-loading">
        <Loader size={28} className="cli-loading__icon" />
        <p>Cargando tu briefing...</p>
      </div>
    );
  }

  const steps = briefingDef.steps;
  const currentStep = steps[step];

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = async (finalSubmit = false) => {
    setSaving(true);
    const payload = {
      ...form,
      quote_id: quoteId,
      user_id: user?.id,
      image_urls: images,
      status: finalSubmit ? 'submitted' : 'draft',
    };
    if (existingId) {
      await supabase.from('briefings').update(payload).eq('id', existingId);
    } else {
      const { data } = await supabase.from('briefings').insert(payload).select().single();
      if (data) setExistingId(data.id);
    }
    if (finalSubmit) {
      await supabase.from('quotes').update({ status: 'in_progress' }).eq('id', quoteId);
      setSubmitted(true);
    }
    setSaving(false);
  };

  const next = async () => {
    await handleSave(false);
    setStep(s => Math.min(s + 1, steps.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const back = () => {
    setStep(s => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (submitted) return <SubmittedScreen />;

  const progress = Math.round(((step + 1) / steps.length) * 100);

  return (
    <div className="cli-layout">
      <header className="cli-header">
        <img src="/images/logoazul.png" alt="Agutidesigns" className="cli-header__logo" />
        {quote && (
          <div className="cli-header__quote">
            <span>{briefingDef.label}</span>
            <strong>{(quote.total || 0).toLocaleString('es-ES')}€</strong>
          </div>
        )}
      </header>

      {/* Progress bar */}
      <div className="cli-progressbar">
        <div className="cli-progressbar__inner">
          <div className="cli-progressbar__steps">
            {steps.map((s, i) => (
              <div
                key={s.id}
                className={`cli-progressbar__step ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}
              >
                <div className="cli-progressbar__dot">
                  {i < step ? <CheckCircle size={14} /> : <span>{i + 1}</span>}
                </div>
                <span className="cli-progressbar__label">{s.title}</span>
              </div>
            ))}
          </div>
          <div className="cli-progressbar__track">
            <div className="cli-progressbar__fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="cli-body">
        <div className="cli-card">
          <div className="cli-step__header">
            <span className="cli-step__counter">Paso {step + 1} de {steps.length}</span>
            <h2 className="cli-step__title">{currentStep.title}</h2>
            {currentStep.sub && <p className="cli-step__sub">{currentStep.sub}</p>}
          </div>

          <div className="cli-step__fields">
            {currentStep.fields.map(f => (
              <Field
                key={f.key}
                label={f.label}
                value={form[f.key] || ''}
                onChange={v => update(f.key, v)}
                placeholder={f.placeholder}
                multiline={f.multiline}
                rows={f.rows}
              />
            ))}

            {currentStep.hasImageUpload && (
              <ImageUpload
                label={currentStep.imageLabel}
                quoteId={quoteId}
                images={images}
                setImages={setImages}
              />
            )}
          </div>

          <div className="cli-nav">
            {step > 0 && (
              <button className="cli-btn cli-btn--ghost" onClick={back}>
                <ChevronLeft size={16} /> Anterior
              </button>
            )}
            <div style={{ flex: 1 }} />
            {step < steps.length - 1 ? (
              <button className="cli-btn cli-btn--primary" onClick={next} disabled={saving}>
                {saving ? 'Guardando...' : 'Siguiente'} <ChevronRight size={16} />
              </button>
            ) : (
              <button className="cli-btn cli-btn--primary" onClick={() => handleSave(true)} disabled={saving}>
                <Send size={16} /> {saving ? 'Enviando...' : 'Enviar briefing completo'}
              </button>
            )}
          </div>
        </div>
        <p className="cli-autosave">💾 Se guarda automáticamente al pasar al siguiente paso</p>
      </div>
    </div>
  );
}

/* ============================================
   IMAGE UPLOAD
   ============================================ */
function ImageUpload({ label, quoteId, images, setImages }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFiles = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    setError('');
    const uploaded = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;
      if (file.size > 10 * 1024 * 1024) { setError('Cada imagen debe ser menor de 10MB'); continue; }
      const ext = file.name.split('.').pop();
      const path = `briefings/${quoteId || 'general'}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('briefing-assets').upload(path, file);
      if (uploadError) { setError('Error subiendo imagen. Revisa que el bucket existe en Supabase.'); continue; }
      const { data: { publicUrl } } = supabase.storage.from('briefing-assets').getPublicUrl(path);
      uploaded.push(publicUrl);
    }
    setImages(prev => [...prev, ...uploaded]);
    setUploading(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const removeImage = (url) => setImages(prev => prev.filter(u => u !== url));

  return (
    <div className="cli-upload">
      <label className="cli-field__label">{label || 'Subir imágenes'}</label>

      <div
        className={`cli-upload__zone ${uploading ? 'cli-upload__zone--uploading' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
      >
        {uploading ? (
          <><Loader size={24} className="cli-upload__loader" /><span>Subiendo...</span></>
        ) : (
          <><Upload size={24} /><span>Arrastra imágenes aquí o haz clic para seleccionar</span><span className="cli-upload__hint">PNG, JPG, WEBP · Máx. 10MB por imagen</span></>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={e => handleFiles(e.target.files)}
      />

      {error && <p className="cli-upload__error">{error}</p>}

      {images.length > 0 && (
        <div className="cli-upload__gallery">
          {images.map((url, i) => (
            <div key={i} className="cli-upload__thumb">
              <img src={url} alt={`Imagen ${i + 1}`} />
              <button className="cli-upload__remove" onClick={() => removeImage(url)}>
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SubmittedScreen() {
  return (
    <div className="cli-submitted">
      <div className="cli-submitted__card">
        <CheckCircle size={56} className="cli-submitted__icon" />
        <h2>¡Briefing enviado! 🎉</h2>
        <p>He recibido toda la información de tu proyecto. En menos de 24h me pongo en contacto contigo para comenzar. ¡Esto va a quedar increíble!</p>
        <p className="cli-submitted__sign">— Guti, Agutidesigns</p>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, multiline, rows = 3 }) {
  return (
    <div className="cli-field">
      <label className="cli-field__label">{label}</label>
      {multiline ? (
        <textarea
          className="cli-field__input cli-field__input--textarea"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
        />
      ) : (
        <input
          type="text"
          className="cli-field__input"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}
