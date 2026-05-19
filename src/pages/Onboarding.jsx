import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconArrowRight, IconArrowLeft, IconUpload, IconPlus, IconTrash,
  IconEye, IconCheck, IconBolt, IconX, IconMaximize, IconBrush,
  IconPalette, IconBuilding, IconFileText, IconSettings,
  IconPhone, IconMail, IconMapPin, IconClock, IconWorld,
  IconBrandInstagram, IconBrandFacebook, IconBrandTiktok, IconBrandLinkedin,
  IconBriefcase, IconUsers, IconStar, IconHelp, IconChartBar,
  IconBrandWhatsapp, IconMessage, IconShield, IconAward,
  IconLanguage, IconPhoto, IconSearch, IconBrandGoogle,
  IconToggleLeft, IconToggleRight, IconUser, IconTypography, IconLink,
  IconExternalLink, IconLoader2,
} from '@tabler/icons-react';
import ClinicaDentalTemplate from '../templates/ClinicaDental/Template';
import FisioterapiaTemplate  from '../templates/Fisioterapia/Template';
import PsicologiaTemplate    from '../templates/Psicologia/Template';
import RestauranteTemplate   from '../templates/Restaurante/Template';
import AbogadosTemplate      from '../templates/Abogados/Template';
import GenericaTemplate      from '../templates/Generica/Template';
import { config as clinicaConfig } from '../templates/ClinicaDental/config';
import { config as fisioConfig   } from '../templates/Fisioterapia/config';
import { config as psiConfig     } from '../templates/Psicologia/config';
import { config as restConfig    } from '../templates/Restaurante/config';
import { config as abogConfig    } from '../templates/Abogados/config';
import { config as genConfig     } from '../templates/Generica/config';
import { generateDescription } from '../utils/generateContent';
import { extractColorsFromUrl, makeLightVariant } from '../utils/colorExtract';
import './Onboarding.css';

/* ── Template registry ── */
const TEMPLATES = {
  ClinicaDental: { component: ClinicaDentalTemplate, config: clinicaConfig },
  Fisioterapia:  { component: FisioterapiaTemplate,  config: fisioConfig   },
  Psicologia:    { component: PsicologiaTemplate,    config: psiConfig     },
  Restaurante:   { component: RestauranteTemplate,   config: restConfig    },
  Abogados:      { component: AbogadosTemplate,      config: abogConfig    },
  Generica:      { component: GenericaTemplate,      config: genConfig     },
};

const TPL_LIST = [
  { id: 'ClinicaDental', name: 'Clínica Dental',     desc: 'Clínicas, consultas y centros médicos'  },
  { id: 'Fisioterapia',  name: 'Fisioterapia',        desc: 'Centros de salud y bienestar físico'    },
  { id: 'Psicologia',    name: 'Psicología',          desc: 'Terapia, coaching y bienestar mental'   },
  { id: 'Restaurante',   name: 'Restaurante / Bar',   desc: 'Hostelería, restauración y ocio'        },
  { id: 'Abogados',      name: 'Abogados / Asesoría', desc: 'Servicios legales y consultoría'        },
  { id: 'Generica',      name: 'Negocio general',     desc: 'Cualquier tipo de empresa o servicio'   },
];

/* ── Sector → template mapping ── */
const SECTORS = [
  { value: 'clinica-dental', label: 'Clínica Dental',      template: 'ClinicaDental' },
  { value: 'fisioterapia',   label: 'Fisioterapia',         template: 'Fisioterapia'  },
  { value: 'psicologia',     label: 'Psicología / Terapia', template: 'Psicologia'    },
  { value: 'restaurante',    label: 'Restaurante / Bar',    template: 'Restaurante'   },
  { value: 'abogados',       label: 'Abogados / Asesoría',  template: 'Abogados'      },
  { value: 'otro',           label: 'Otro negocio',         template: 'Generica'      },
];

/* ── Style variants per template ── */
const STYLE_VARIANTS = {
  ClinicaDental: [
    { name: 'Azul clínico',   primary: '#1B6CA8', secondary: '#E8F4FD' },
    { name: 'Teal moderno',   primary: '#0E7490', secondary: '#E0F7FA' },
    { name: 'Verde salud',    primary: '#1A8A5A', secondary: '#E8F5F0' },
    { name: 'Índigo premium', primary: '#4338CA', secondary: '#EEF2FF' },
  ],
  Fisioterapia: [
    { name: 'Verde natural',   primary: '#2D9E4F', secondary: '#E8F5EC' },
    { name: 'Naranja energía', primary: '#EA580C', secondary: '#FFF7ED' },
    { name: 'Azul calma',      primary: '#2563EB', secondary: '#EFF6FF' },
    { name: 'Teal vitalidad',  primary: '#0D9488', secondary: '#F0FDFA' },
  ],
  Psicologia: [
    { name: 'Lavanda calma', primary: '#6B5B95', secondary: '#F5F0FF' },
    { name: 'Azul sereno',   primary: '#3B82F6', secondary: '#EFF6FF' },
    { name: 'Verde armonía', primary: '#059669', secondary: '#ECFDF5' },
    { name: 'Rosa suave',    primary: '#BE185D', secondary: '#FDF2F8' },
  ],
  Restaurante: [
    { name: 'Tierra cálida',  primary: '#C8935A', secondary: '#FFF8F2' },
    { name: 'Rojo gourmet',   primary: '#DC2626', secondary: '#FEF2F2' },
    { name: 'Negro elegante', primary: '#1C1917', secondary: '#F5F5F4' },
    { name: 'Verde bistró',   primary: '#16A34A', secondary: '#F0FDF4' },
  ],
  Abogados: [
    { name: 'Marino formal', primary: '#1A2744', secondary: '#F0EDE8' },
    { name: 'Gris platino',  primary: '#374151', secondary: '#F9FAFB' },
    { name: 'Burdeos',       primary: '#7F1D1D', secondary: '#FEF2F2' },
    { name: 'Verde bufete',  primary: '#064E3B', secondary: '#ECFDF5' },
  ],
  Generica: [
    { name: 'Violeta moderno', primary: '#6C63FF', secondary: '#F8F7FF' },
    { name: 'Azul confianza',  primary: '#2563EB', secondary: '#EFF6FF' },
    { name: 'Coral dinámico',  primary: '#EA580C', secondary: '#FFF7ED' },
    { name: 'Esmeralda',       primary: '#059669', secondary: '#ECFDF5' },
  ],
};

/* ── Realistic demo data per template ── */
const DEMO_DATA = {
  ClinicaDental: {
    businessName: 'Clínica Dental Sonrisa',
    heroTitle: 'Tu sonrisa perfecta, nuestra misión',
    description: 'En Clínica Dental Sonrisa ponemos tu salud bucal en el centro de todo. Tecnología de vanguardia, profesionales certificados y un trato cercano que te hará sentir en casa desde la primera visita.',
    about: 'Más de 15 años cuidando sonrisas en Madrid. Nuestro equipo combina la última tecnología con atención personalizada para ofrecerte los mejores resultados.',
    address: 'Calle Gran Vía 48, Madrid', phone: '91 234 56 78', email: 'info@clinicasonrisa.com',
    services: [
      { id: 1, name: 'Limpieza dental',       description: 'Higiene oral profesional',   price: '60€',          photoPreview: '' },
      { id: 2, name: 'Ortodoncia invisible',   description: 'Alineadores a medida',       price: 'Desde 2.400€', photoPreview: '' },
      { id: 3, name: 'Implantes dentales',     description: 'Implantes de titanio',       price: 'Desde 950€',   photoPreview: '' },
    ],
    testimonials: [
      { id: 1, name: 'María García',  text: 'Excelente atención y resultados increíbles. Mi ortodoncia quedó perfecta.',       rating: 5 },
      { id: 2, name: 'Carlos López',  text: 'Los mejores dentistas de Madrid. Profesionales y muy amables con cada paciente.',   rating: 5 },
    ],
  },
  Fisioterapia: {
    businessName: 'Centro FisioVital',
    heroTitle: 'Recupera tu movilidad, vive sin dolor',
    description: 'En FisioVital combinamos técnicas manuales avanzadas con tecnología de última generación para tratar la raíz de tu dolencia y darte resultados duraderos.',
    about: 'Especialistas en fisioterapia deportiva, neurológica y traumatológica. 10 años ayudando a pacientes a recuperar su vida activa.',
    address: 'Paseo de la Castellana 120, Madrid', phone: '91 567 89 01', email: 'citas@fisiovital.es',
    services: [
      { id: 1, name: 'Fisioterapia deportiva', description: 'Recuperación de lesiones',  price: '55€',       photoPreview: '' },
      { id: 2, name: 'Masaje terapéutico',     description: 'Alivio de contracturas',    price: '45€',       photoPreview: '' },
      { id: 3, name: 'Pilates terapéutico',    description: 'Grupos reducidos',          price: '35€/sesión',photoPreview: '' },
    ],
    testimonials: [
      { id: 1, name: 'Ana Martínez', text: 'Después de mi operación de rodilla, recuperé la movilidad completa en tiempo récord.', rating: 5 },
      { id: 2, name: 'Javier Ruiz',  text: 'Llevo meses sin dolor de espalda por primera vez en años. Increíble equipo.',          rating: 5 },
    ],
  },
  Psicologia: {
    businessName: 'Centro Psicología Mindful',
    heroTitle: 'Tu bienestar emocional, nuestra prioridad',
    description: 'Un espacio de escucha, confianza y transformación personal. Terapia individual, de pareja y grupal con enfoque integrativo y basado en evidencia.',
    about: 'Equipo de psicólogos colegiados con formación en terapia cognitivo-conductual, EMDR y mindfulness. Consultas presenciales y online.',
    address: 'Calle Serrano 45, Madrid', phone: '91 345 67 89', email: 'consultas@psicologiamindful.com',
    services: [
      { id: 1, name: 'Terapia individual', description: 'Sesiones personalizadas',   price: '75€', photoPreview: '' },
      { id: 2, name: 'Terapia de pareja',  description: 'Mejora la comunicación',    price: '90€', photoPreview: '' },
      { id: 3, name: 'Psicología infantil',description: 'Niños y adolescentes',      price: '70€', photoPreview: '' },
    ],
    testimonials: [
      { id: 1, name: 'Laura Fernández', text: 'Me ayudaron a superar mi ansiedad. Tengo herramientas para gestionar el día a día.', rating: 5 },
      { id: 2, name: 'Pablo Sánchez',   text: 'La terapia de pareja salvó nuestra relación. Muy recomendable.',                    rating: 5 },
    ],
  },
  Restaurante: {
    businessName: 'Restaurante El Rincón',
    heroTitle: 'Gastronomía que despierta los sentidos',
    description: 'Cocina mediterránea de autor con ingredientes frescos de temporada. Una experiencia gastronómica única en el corazón de la ciudad.',
    about: 'Desde 1995 ofrecemos una cocina honesta con recetas tradicionales y toques contemporáneos. Chef formado en las mejores escuelas de Europa.',
    address: 'Plaza Mayor 5, Madrid', phone: '91 123 45 67', email: 'reservas@elrincon.es',
    services: [
      { id: 1, name: 'Menú del día',       description: 'Primero, segundo y postre', price: '18€',       photoPreview: '' },
      { id: 2, name: 'Carta',              description: 'Platos de temporada',       price: 'Desde 12€', photoPreview: '' },
      { id: 3, name: 'Menú degustación',   description: '7 platos + maridaje',       price: '65€',       photoPreview: '' },
    ],
    testimonials: [
      { id: 1, name: 'Isabel Torres',  text: 'La mejor croqueta de Madrid. Ambiente acogedor y servicio impecable.',       rating: 5 },
      { id: 2, name: 'Roberto Gómez', text: 'Llevamos años viniendo y siempre sorprenden con platos nuevos. ¡10/10!',     rating: 5 },
    ],
  },
  Abogados: {
    businessName: 'Bufete Jurídico Lex',
    heroTitle: 'Defensa jurídica con rigor y resultados',
    description: 'Más de 20 años defendiendo los intereses de personas y empresas. Especialistas en derecho civil, mercantil, laboral y penal.',
    about: 'Nuestro equipo combina rigor técnico, estrategia y compromiso con el cliente. Soluciones legales a medida para cada caso.',
    address: 'Calle Alcalá 72, Madrid', phone: '91 789 01 23', email: 'contacto@bufetelex.com',
    services: [
      { id: 1, name: 'Derecho civil',     description: 'Contratos, herencias, divorcios', price: 'Consulta gratuita', photoPreview: '' },
      { id: 2, name: 'Derecho laboral',   description: 'Despidos y reclamaciones',        price: 'Consulta gratuita', photoPreview: '' },
      { id: 3, name: 'Derecho mercantil', description: 'Constitución y contratos',        price: 'Consulta gratuita', photoPreview: '' },
    ],
    testimonials: [
      { id: 1, name: 'Empresa TechSol',   text: 'Excelente gestión de nuestro contrato mercantil. Profesionales y eficientes.', rating: 5 },
      { id: 2, name: 'Miguel Rodríguez',  text: 'Me ayudaron a ganar mi caso laboral. Muy satisfecho con el resultado.',         rating: 5 },
    ],
  },
  Generica: {
    businessName: 'Estudio Creativo Nexus',
    heroTitle: 'Soluciones creativas para tu negocio',
    description: 'Diseño, estrategia y tecnología al servicio de tu marca. Ayudamos a negocios a crecer con propuestas visuales únicas y efectivas.',
    about: 'Somos un equipo multidisciplinar con más de 10 años creando experiencias digitales y físicas para marcas que quieren destacar.',
    address: 'Calle Fuencarral 89, Madrid', phone: '91 456 78 90', email: 'hola@estudionexus.com',
    services: [
      { id: 1, name: 'Diseño gráfico',    description: 'Identidad y branding',    price: 'Desde 500€',     photoPreview: '' },
      { id: 2, name: 'Diseño web',        description: 'Webs modernas y rápidas', price: 'Desde 1.500€',   photoPreview: '' },
      { id: 3, name: 'Marketing digital', description: 'Redes y campañas',        price: 'Desde 300€/mes', photoPreview: '' },
    ],
    testimonials: [
      { id: 1, name: 'StartupXYZ',      text: 'Renovaron por completo nuestra imagen. Los resultados hablan por sí solos.',       rating: 5 },
      { id: 2, name: 'Boutique Moda',   text: 'Profesionales, creativos y muy atentos al detalle. Totalmente recomendables.',     rating: 5 },
    ],
  },
};

const DAYS = [
  { key: 'lunes',     label: 'Lunes'     },
  { key: 'martes',    label: 'Martes'    },
  { key: 'miercoles', label: 'Miércoles' },
  { key: 'jueves',    label: 'Jueves'    },
  { key: 'viernes',   label: 'Viernes'   },
  { key: 'sabado',    label: 'Sábado'    },
  { key: 'domingo',   label: 'Domingo'   },
];

const LANGUAGES = ['Español', 'English', 'Français', 'Deutsch', 'Italiano', 'Português', 'Català', 'Euskera'];

const FONT_PAIRS = [
  { id: 'inter',    name: 'Inter',            subtitle: 'Moderno y limpio',   css: 'Inter, sans-serif'                  },
  { id: 'playfair', name: 'Playfair Display', subtitle: 'Elegante y premium', css: '"Playfair Display", Georgia, serif' },
  { id: 'poppins',  name: 'Poppins',          subtitle: 'Amigable y cercano', css: 'Poppins, sans-serif'                },
];

/* 5 visible steps */
const STEPS = [
  { num: 1, label: 'Diseño',     Icon: IconBrush    },
  { num: 2, label: 'Negocio',    Icon: IconBuilding },
  { num: 3, label: 'Identidad',  Icon: IconPalette  },
  { num: 4, label: 'Contenido',  Icon: IconFileText },
  { num: 5, label: 'SEO',        Icon: IconSettings },
];

const INITIAL_DATA = {
  selectedTemplate: 'ClinicaDental',

  /* Step 2 — Negocio */
  businessName: '', sector: '',
  phone: '', email: '', address: '', website: '',
  instagram: '', facebook: '', tiktok: '', linkedin: '',
  scheduleByDay: {
    lunes:     { open: true,  from: '09:00', to: '20:00' },
    martes:    { open: true,  from: '09:00', to: '20:00' },
    miercoles: { open: true,  from: '09:00', to: '20:00' },
    jueves:    { open: true,  from: '09:00', to: '20:00' },
    viernes:   { open: true,  from: '09:00', to: '20:00' },
    sabado:    { open: false, from: '09:00', to: '14:00' },
    domingo:   { open: false, from: '',      to: ''      },
  },

  /* Step 3 — Identidad */
  logo: null, logoPreview: '',
  primaryColor: '#1B6CA8', secondaryColor: '#E8F4FD',
  fontPair: 'inter',
  referenceUrls: ['', '', ''],

  /* Step 4 — Contenido */
  heroTitle: '', description: '', about: '',
  heroPhoto: null, heroPhotoPreview: '',
  services: [
    { id: 1, name: '', description: '', price: '', photoPreview: '' },
    { id: 2, name: '', description: '', price: '', photoPreview: '' },
    { id: 3, name: '', description: '', price: '', photoPreview: '' },
  ],
  gallery: [], galleryPreviews: [],
  team: [], testimonials: [], faqs: [],
  coverageArea: '', certifications: '',
  languages: ['Español'],

  /* Step 5 — SEO */
  seoTitle: '', seoDescription: '', seoKeyword: '',
  domainOption: 'new', domainSearch: '', domainExisting: '',
  gaId: '', fbPixel: '',
  whatsappEnabled: false, whatsappNumber: '',
  chatEnabled: false, cookieEnabled: true,
  privacyPolicy: '',
};

const slide = {
  enter: d => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.35, ease: 'easeOut' } },
  exit:   d => ({ x: d > 0 ? -60 : 60, opacity: 0, transition: { duration: 0.25 } }),
};

let _seq = 100;
const uid = () => ++_seq;

function computeSchedule(sbd) {
  const labels = { lunes:'Lun', martes:'Mar', miercoles:'Mié', jueves:'Jue', viernes:'Vie', sabado:'Sáb', domingo:'Dom' };
  return Object.entries(sbd)
    .filter(([, v]) => v.open && v.from && v.to)
    .map(([k, v]) => `${labels[k]} ${v.from}–${v.to}`)
    .join(' · ');
}

/* Merges user data with template demo data — demo fills any empty fields */
function mergeWithDemo(userData, demoData) {
  const d = demoData || {};
  const result = {
    ...userData,
    schedule: computeSchedule(userData.scheduleByDay),
    photosPreviews: [userData.heroPhotoPreview, ...userData.galleryPreviews].filter(Boolean),
  };
  for (const f of ['businessName', 'heroTitle', 'description', 'about', 'address', 'phone', 'email']) {
    if (!userData[f]?.trim()) result[f] = d[f] || '';
  }
  if (!userData.services?.some(s => s.name)) result.services = d.services || userData.services;
  if (!userData.testimonials?.length)         result.testimonials = d.testimonials || [];
  return result;
}

/* Full demo preview object for template cards */
function demoPreview(tplId) {
  const d    = DEMO_DATA[tplId] || {};
  const cfg  = TEMPLATES[tplId]?.config;
  return {
    ...d,
    primaryColor:    cfg?.primaryColor   || '#2563EB',
    secondaryColor:  cfg?.secondaryColor || '#EFF6FF',
    schedule:        'Lun–Vie 09:00–20:00 · Sáb 09:00–14:00',
    photosPreviews:  [],
    team:            [],
    faqs:            [],
    gallery:         [],
    galleryPreviews: [],
    instagram: '', facebook: '', tiktok: '', linkedin: '',
    logoPreview: '', fontPair: 'inter',
  };
}

function readFile(file) {
  return new Promise(resolve => {
    const r = new FileReader();
    r.onload = e => resolve(e.target.result);
    r.readAsDataURL(file);
  });
}

/* ═════════════════════════════════════════════════════════ */
export default function Onboarding() {
  const [step, setStep]         = useState(1);
  const [dir,  setDir]          = useState(1);
  const [data, setData]         = useState(INITIAL_DATA);
  const [scale, setScale]       = useState(0.42);
  const [modal, setModal]       = useState(false);
  const [showStyles, setShowStyles] = useState(false);
  const [gen,   setGen]         = useState({});

  const [refState, setRefState] = useState([
    { colors: [], loading: false },
    { colors: [], loading: false },
    { colors: [], loading: false },
  ]);
  const refTimers = useRef([null, null, null]);
  const previewRef = useRef(null);

  useEffect(() => {
    const ro = new ResizeObserver(es => {
      for (const e of es) setScale(e.contentRect.width / 1440);
    });
    if (previewRef.current) ro.observe(previewRef.current);
    return () => ro.disconnect();
  }, []);

  const up = useCallback((k, v) => setData(p => ({ ...p, [k]: v })), []);

  const goNext = () => { setDir(1);  setStep(s => Math.min(s + 1, 5)); };
  const goPrev = () => { setDir(-1); setStep(s => Math.max(s - 1, 1)); };

  /* Select template from Step 1 — sets template and matching default colors */
  const selectTemplate = useCallback((id) => {
    const cfg = TEMPLATES[id]?.config;
    setData(p => ({
      ...p,
      selectedTemplate: id,
      primaryColor:   cfg?.primaryColor   || p.primaryColor,
      secondaryColor: cfg?.secondaryColor || p.secondaryColor,
    }));
  }, []);

  /* Sector selection — does NOT override user's template choice */
  const handleSector = useCallback((value) => {
    setData(p => ({ ...p, sector: value }));
  }, []);

  const applyVariant = useCallback((v) => {
    setData(p => ({ ...p, primaryColor: v.primary, secondaryColor: v.secondary }));
    setShowStyles(false);
  }, []);

  const applyRefColor = useCallback((hex) => {
    setData(p => ({ ...p, primaryColor: hex, secondaryColor: makeLightVariant(hex) }));
  }, []);

  const handleRefUrl = useCallback((i, value) => {
    setData(p => {
      const urls = [...p.referenceUrls];
      urls[i] = value;
      return { ...p, referenceUrls: urls };
    });
    setRefState(s => s.map((v, j) => j === i ? { colors: [], loading: false } : v));
    if (refTimers.current[i]) clearTimeout(refTimers.current[i]);
    if (!value.trim()) return;
    refTimers.current[i] = setTimeout(async () => {
      setRefState(s => s.map((v, j) => j === i ? { ...v, loading: true } : v));
      const colors = await extractColorsFromUrl(value);
      setRefState(s => s.map((v, j) => j === i ? { colors: colors || [], loading: false } : v));
    }, 1400);
  }, []);

  /* ── file uploads ── */
  const uploadLogo    = async e => { const f = e.target.files[0]; if (!f) return; up('logoPreview', await readFile(f)); };
  const uploadHero    = async e => { const f = e.target.files[0]; if (!f) return; up('heroPhotoPreview', await readFile(f)); };
  const uploadGallery = async e => {
    const files = Array.from(e.target.files);
    const previews = await Promise.all(files.map(readFile));
    setData(p => ({
      ...p,
      gallery:         [...p.gallery,         ...files   ].slice(0, 12),
      galleryPreviews: [...p.galleryPreviews,  ...previews].slice(0, 12),
    }));
  };
  const rmGallery = i => setData(p => ({
    ...p,
    gallery:         p.gallery.filter((_, j) => j !== i),
    galleryPreviews: p.galleryPreviews.filter((_, j) => j !== i),
  }));

  /* ── services ── */
  const addSvc   = () => { if (data.services.length >= 10) return; setData(p => ({ ...p, services: [...p.services, { id: uid(), name: '', description: '', price: '', photoPreview: '' }] })); };
  const rmSvc    = id => setData(p => ({ ...p, services: p.services.length > 1 ? p.services.filter(s => s.id !== id) : p.services }));
  const upSvc    = (id, k, v) => setData(p => ({ ...p, services: p.services.map(s => s.id === id ? { ...s, [k]: v } : s) }));
  const svcPhoto = async (id, e) => { const f = e.target.files[0]; if (!f) return; upSvc(id, 'photoPreview', await readFile(f)); };

  /* ── team ── */
  const addTeam   = () => { if (data.team.length >= 6) return; setData(p => ({ ...p, team: [...p.team, { id: uid(), name: '', role: '', photoPreview: '' }] })); };
  const rmTeam    = id => setData(p => ({ ...p, team: p.team.filter(t => t.id !== id) }));
  const upTeam    = (id, k, v) => setData(p => ({ ...p, team: p.team.map(t => t.id === id ? { ...t, [k]: v } : t) }));
  const teamPhoto = async (id, e) => { const f = e.target.files[0]; if (!f) return; upTeam(id, 'photoPreview', await readFile(f)); };

  /* ── testimonials ── */
  const addTest = () => { if (data.testimonials.length >= 5) return; setData(p => ({ ...p, testimonials: [...p.testimonials, { id: uid(), name: '', text: '', rating: 5 }] })); };
  const rmTest  = id => setData(p => ({ ...p, testimonials: p.testimonials.filter(t => t.id !== id) }));
  const upTest  = (id, k, v) => setData(p => ({ ...p, testimonials: p.testimonials.map(t => t.id === id ? { ...t, [k]: v } : t) }));

  /* ── faqs ── */
  const addFaq = () => { if (data.faqs.length >= 8) return; setData(p => ({ ...p, faqs: [...p.faqs, { id: uid(), question: '', answer: '' }] })); };
  const rmFaq  = id => setData(p => ({ ...p, faqs: p.faqs.filter(f => f.id !== id) }));
  const upFaq  = (id, k, v) => setData(p => ({ ...p, faqs: p.faqs.map(f => f.id === id ? { ...f, [k]: v } : f) }));

  /* ── schedule ── */
  const upDay = (day, k, v) => setData(p => ({ ...p, scheduleByDay: { ...p.scheduleByDay, [day]: { ...p.scheduleByDay[day], [k]: v } } }));

  /* ── languages ── */
  const toggleLang = lang => setData(p => ({ ...p, languages: p.languages.includes(lang) ? p.languages.filter(l => l !== lang) : [...p.languages, lang] }));

  /* ── AI generation ── */
  const generate = async field => {
    setGen(g => ({ ...g, [field]: true }));
    try {
      if (field === 'description') {
        up('description', await generateDescription(data));
      } else if (field === 'heroTitle') {
        await new Promise(r => setTimeout(r, 700));
        const sector = SECTORS.find(s => s.value === data.sector)?.label || 'servicios';
        const city = data.address?.split(',').slice(-1)[0]?.trim() || 'España';
        up('heroTitle', data.businessName ? `${data.businessName} — ${sector} de confianza en ${city}` : 'Tu web, tu identidad');
      } else if (field === 'about') {
        await new Promise(r => setTimeout(r, 900));
        up('about', `Somos ${data.businessName || 'un negocio'} con una sólida trayectoria en el sector. Nuestro equipo trabaja cada día para ofrecer la mejor experiencia a nuestros clientes, combinando profesionalidad, dedicación y resultados que superan las expectativas.`);
      } else if (field === 'faqs') {
        await new Promise(r => setTimeout(r, 1100));
        const items = [
          { id: uid(), question: '¿Cómo puedo contactar con vosotros?', answer: `Puedes llamarnos al ${data.phone || 'nuestro teléfono'} o enviarnos un email. También puedes usar el formulario de contacto de nuestra web.` },
          { id: uid(), question: '¿Cuál es vuestro horario de atención?', answer: computeSchedule(data.scheduleByDay) || 'Lunes a viernes de 9:00 a 20:00.' },
          { id: uid(), question: '¿Dónde estáis ubicados?', answer: data.address || 'Consulta nuestra dirección en el apartado de contacto.' },
        ];
        setData(p => ({ ...p, faqs: [...p.faqs, ...items].slice(0, 8) }));
      } else if (field === 'seoTitle') {
        await new Promise(r => setTimeout(r, 600));
        const sectorLabel = SECTORS.find(s => s.value === data.sector)?.label || 'Servicios';
        const city = data.address?.split(',').slice(-1)[0]?.trim() || 'España';
        up('seoTitle', `${data.businessName || 'Tu negocio'} | ${sectorLabel} en ${city}`);
      } else if (field === 'seoDescription') {
        await new Promise(r => setTimeout(r, 600));
        const base = data.description || `Servicios de ${SECTORS.find(s => s.value === data.sector)?.label?.toLowerCase() || 'calidad'} en ${data.address?.split(',').slice(-1)[0]?.trim() || 'España'}. Contacta hoy.`;
        up('seoDescription', base.slice(0, 155));
      } else if (field === 'privacyPolicy') {
        await new Promise(r => setTimeout(r, 1400));
        up('privacyPolicy', `POLÍTICA DE PRIVACIDAD\n\nResponsable: ${data.businessName || 'El Responsable'}\nDirección: ${data.address || 'España'}\nEmail: ${data.email || 'info@negocio.com'}\n\nDatos que recogemos: nombre, email y teléfono al rellenar el formulario de contacto.\nFinalidad: gestión de consultas y prestación del servicio.\nBase legal: consentimiento del interesado (Art. 6.1.a RGPD).\nConservación: hasta que solicites la supresión.\nDerechos: acceso, rectificación, supresión, oposición y portabilidad. Escríbenos a ${data.email || 'info@negocio.com'}.`);
      }
    } finally {
      setGen(g => ({ ...g, [field]: false }));
    }
  };

  /* Live preview data — demo fills any empty user fields */
  const templateData  = mergeWithDemo(data, DEMO_DATA[data.selectedTemplate]);
  const CurrentTpl    = TEMPLATES[data.selectedTemplate]?.component || GenericaTemplate;
  const progress      = ((step - 1) / 4) * 100;
  const variants      = STYLE_VARIANTS[data.selectedTemplate] || STYLE_VARIANTS.Generica;

  return (
    <div className="ob-root">
      <div className="ob-progress-bar">
        <div className="ob-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <header className="ob-header">
        <div className="ob-header-logo">
          <span className="ob-logo-dot" />
          <span className="ob-logo-text">agutidesigns</span>
        </div>
        <div className="ob-steps-bar">
          {STEPS.map(({ num, label, Icon }) => (
            <div key={num} className={`ob-step-item${step === num ? ' active' : ''}${step > num ? ' done' : ''}`}>
              <div className="ob-step-circle">
                {step > num ? <IconCheck size={13} /> : <Icon size={14} />}
              </div>
              <span className="ob-step-label">{label}</span>
            </div>
          ))}
        </div>
        <span className="ob-step-counter">Paso {step} de 5</span>
      </header>

      <div className="ob-layout">
        {/* ── FORM ── */}
        <div className="ob-form-panel">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div key={step} custom={dir} variants={slide} initial="enter" animate="center" exit="exit" className="ob-step-content">
              {step === 1 && <StepPlantilla data={data} selectTemplate={selectTemplate} />}
              {step === 2 && <StepNegocio data={data} up={up} handleSector={handleSector} upDay={upDay} />}
              {step === 3 && <StepIdentidad data={data} up={up} onLogo={uploadLogo} refState={refState} handleRefUrl={handleRefUrl} applyRefColor={applyRefColor} />}
              {step === 4 && <StepContenido
                data={data} up={up} gen={gen} generate={generate}
                addSvc={addSvc} rmSvc={rmSvc} upSvc={upSvc} svcPhoto={svcPhoto}
                onHero={uploadHero}
                onGallery={uploadGallery} rmGallery={rmGallery}
                addTeam={addTeam} rmTeam={rmTeam} upTeam={upTeam} teamPhoto={teamPhoto}
                addTest={addTest} rmTest={rmTest} upTest={upTest}
                addFaq={addFaq} rmFaq={rmFaq} upFaq={upFaq}
                toggleLang={toggleLang}
              />}
              {step === 5 && <StepSeo data={data} up={up} gen={gen} generate={generate} />}
            </motion.div>
          </AnimatePresence>

          <div className="ob-nav-buttons">
            {step > 1 && (
              <button className="ob-btn-prev" onClick={goPrev}>
                <IconArrowLeft size={15} /> Anterior
              </button>
            )}
            {step < 5 ? (
              <button className="ob-btn-next" onClick={goNext}>
                Siguiente <IconArrowRight size={15} />
              </button>
            ) : (
              <button className="ob-btn-finish">
                <IconBolt size={15} /> Activar trial — 1€
              </button>
            )}
          </div>
        </div>

        {/* ── LIVE PREVIEW ── */}
        <div className="ob-preview-panel">
          <div className="ob-preview-header">
            <div className="ob-preview-dots"><span /><span /><span /></div>
            <span className="ob-preview-label">Vista previa en tiempo real</span>
            <button className="ob-preview-expand" onClick={() => setModal(true)}>
              <IconMaximize size={13} />
            </button>
          </div>
          <div className="ob-preview-body">
            <div className="ob-preview-outer" ref={previewRef}>
              <div className="ob-preview-inner" style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: 1440 }}>
                <CurrentTpl businessData={templateData} />
              </div>
            </div>

            <AnimatePresence>
              {showStyles && (
                <motion.div
                  className="ob-styles-panel"
                  initial={{ y: '100%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: '100%', opacity: 0 }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                >
                  <div className="ob-styles-header">
                    <span>Variaciones de estilo</span>
                    <button onClick={() => setShowStyles(false)}><IconX size={14} /></button>
                  </div>
                  <div className="ob-styles-grid">
                    {variants.map((v, i) => (
                      <button
                        key={i}
                        className={`ob-style-card${data.primaryColor === v.primary ? ' active' : ''}`}
                        onClick={() => applyVariant(v)}
                      >
                        <div className="ob-style-swatches">
                          <span style={{ background: v.primary }} />
                          <span style={{ background: v.secondary }} />
                        </div>
                        <span className="ob-style-name">{v.name}</span>
                        {data.primaryColor === v.primary && <IconCheck size={10} className="ob-style-check" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="ob-preview-footer">
            <span className="ob-preview-tag">
              {TEMPLATES[data.selectedTemplate]?.config.name || 'Web personalizada'}
            </span>
            <button className="ob-preview-styles-btn" onClick={() => setShowStyles(s => !s)}>
              <IconPalette size={11} /> Ver otros estilos
            </button>
          </div>
        </div>
      </div>

      {/* Full preview modal */}
      <AnimatePresence>
        {modal && (
          <motion.div className="ob-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModal(false)}>
            <motion.div className="ob-modal" initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }} transition={{ duration: 0.25 }} onClick={e => e.stopPropagation()}>
              <button className="ob-modal-close" onClick={() => setModal(false)}><IconX size={18} /></button>
              <div className="ob-modal-scroll">
                <CurrentTpl businessData={templateData} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── SHARED SMALL COMPONENTS ────────────────────────────── */

function AiBtn({ field, gen, generate }) {
  const loading = gen[field];
  return (
    <button className={`ob-ai-btn${loading ? ' loading' : ''}`} onClick={() => generate(field)} disabled={loading}>
      {loading ? <><span className="ob-spinner" /> Generando…</> : <><IconBolt size={12} /> Generar con IA</>}
    </button>
  );
}

function SectionHead({ icon: Icon, title, count, max, action }) {
  return (
    <div className="ob-section-head">
      <h3 className="ob-section-title">
        {Icon && <Icon size={15} />} {title}
        {max !== undefined && <span className="ob-count">{count}/{max}</span>}
      </h3>
      {action}
    </div>
  );
}

function Toggle({ enabled, onToggle, icon: Icon, label, children }) {
  return (
    <div className={`ob-toggle-row${enabled ? ' on' : ''}`}>
      <div className="ob-toggle-main">
        <div className="ob-toggle-label">{Icon && <Icon size={16} />}<span>{label}</span></div>
        <button className="ob-toggle-btn" onClick={onToggle}>
          {enabled ? <IconToggleRight size={24} /> : <IconToggleLeft size={24} />}
        </button>
      </div>
      {enabled && children && <div className="ob-toggle-sub">{children}</div>}
    </div>
  );
}

/* ── STEP 1 — ELEGIR PLANTILLA ──────────────────────────── */
function StepPlantilla({ data, selectTemplate }) {
  const listRef  = useRef(null);
  const [cardScale, setCardScale] = useState(0.22);

  useEffect(() => {
    const ro = new ResizeObserver(entries => {
      for (const e of entries) {
        const w = e.contentRect.width;
        const cardW = (w - 14) / 2;   /* 2-col grid, 14px gap */
        setCardScale(cardW / 1440);
      }
    });
    if (listRef.current) ro.observe(listRef.current);
    return () => ro.disconnect();
  }, []);

  const cardH = Math.round(900 * cardScale);

  return (
    <div className="ob-step">
      <div className="ob-step-head">
        <h2 className="ob-step-title">Elige tu diseño</h2>
        <p className="ob-step-desc">Selecciona la plantilla que mejor encaja con tu negocio. Personalizarás los colores, textos y fotos en los siguientes pasos.</p>
      </div>

      <div className="ob-tpl-list" ref={listRef}>
        {TPL_LIST.map(({ id, name, desc }) => {
          const Tpl      = TEMPLATES[id].component;
          const selected = data.selectedTemplate === id;
          return (
            <div
              key={id}
              className={`ob-tpl-bigcard${selected ? ' selected' : ''}`}
              onClick={() => selectTemplate(id)}
            >
              <div className="ob-tpl-preview-wrap" style={{ height: cardH }}>
                <div style={{ width: 1440, transform: `scale(${cardScale})`, transformOrigin: 'top left', pointerEvents: 'none' }}>
                  <Tpl businessData={demoPreview(id)} />
                </div>
                <div className="ob-tpl-hover-overlay">
                  <span className="ob-tpl-expand-btn"><IconEye size={13} /> Ver diseño</span>
                </div>
                {selected && (
                  <div className="ob-tpl-selected-badge"><IconCheck size={13} /></div>
                )}
              </div>
              <div className="ob-tpl-card-bar">
                <div>
                  <div className="ob-tpl-card-name">{name}</div>
                  <div className="ob-tpl-card-desc">{desc}</div>
                </div>
                {selected
                  ? <span className="ob-tpl-card-chosen"><IconCheck size={10} /> Elegida</span>
                  : <span className="ob-tpl-card-pick">Elegir →</span>
                }
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── STEP 2 — NEGOCIO ───────────────────────────────────── */
function StepNegocio({ data, up, handleSector, upDay }) {
  return (
    <div className="ob-step">
      <div className="ob-step-head">
        <h2 className="ob-step-title">Tu negocio</h2>
        <p className="ob-step-desc">Información básica que aparecerá en tu web y ayudará a tus clientes a encontrarte.</p>
      </div>

      <div className="ob-section">
        <SectionHead icon={IconBuilding} title="Información básica" />
        <div className="ob-fields">
          <div className="ob-field ob-full">
            <label>Nombre del negocio *</label>
            <input type="text" value={data.businessName} onChange={e => up('businessName', e.target.value)} placeholder="Ej: Clínica Dental García" autoFocus />
          </div>
          <div className="ob-field ob-full">
            <label>Sector</label>
            <select value={data.sector} onChange={e => handleSector(e.target.value)}>
              <option value="">Selecciona tu sector…</option>
              {SECTORS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="ob-section">
        <SectionHead icon={IconPhone} title="Contacto" />
        <div className="ob-fields">
          <div className="ob-field">
            <label><IconPhone size={11} /> Teléfono</label>
            <input type="tel" value={data.phone} onChange={e => up('phone', e.target.value)} placeholder="612 345 678" />
          </div>
          <div className="ob-field">
            <label><IconMail size={11} /> Email</label>
            <input type="email" value={data.email} onChange={e => up('email', e.target.value)} placeholder="info@tunegocio.com" />
          </div>
          <div className="ob-field ob-full">
            <label><IconMapPin size={11} /> Dirección</label>
            <input type="text" value={data.address} onChange={e => up('address', e.target.value)} placeholder="Calle Mayor 15, Madrid" />
          </div>
          <div className="ob-field ob-full">
            <label><IconWorld size={11} /> Web actual (si tienes)</label>
            <input type="url" value={data.website} onChange={e => up('website', e.target.value)} placeholder="https://www.tunegocio.com" />
          </div>
        </div>
      </div>

      <div className="ob-section">
        <SectionHead icon={IconClock} title="Horario de apertura" />
        <div className="ob-schedule">
          {DAYS.map(d => {
            const day = data.scheduleByDay[d.key];
            return (
              <div key={d.key} className={`ob-day-row${day.open ? '' : ' closed'}`}>
                <label className="ob-day-check">
                  <input type="checkbox" checked={day.open} onChange={e => upDay(d.key, 'open', e.target.checked)} />
                  <span className="ob-day-name">{d.label}</span>
                </label>
                {day.open ? (
                  <div className="ob-day-times">
                    <input type="time" value={day.from} onChange={e => upDay(d.key, 'from', e.target.value)} />
                    <span>–</span>
                    <input type="time" value={day.to}   onChange={e => upDay(d.key, 'to',   e.target.value)} />
                  </div>
                ) : (
                  <span className="ob-day-closed">Cerrado</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="ob-section">
        <SectionHead icon={IconBrandInstagram} title="Redes sociales" />
        <div className="ob-fields">
          {[
            { key: 'instagram', Icon: IconBrandInstagram, ph: '@tunegocio'             },
            { key: 'facebook',  Icon: IconBrandFacebook,  ph: 'facebook.com/…'         },
            { key: 'tiktok',    Icon: IconBrandTiktok,    ph: '@tunegocio'             },
            { key: 'linkedin',  Icon: IconBrandLinkedin,  ph: 'linkedin.com/company/…' },
          ].map(({ key, Icon, ph }) => (
            <div key={key} className="ob-field">
              <label><Icon size={11} /> {key.charAt(0).toUpperCase() + key.slice(1)}</label>
              <input type="text" value={data[key]} onChange={e => up(key, e.target.value)} placeholder={ph} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── STEP 3 — IDENTIDAD ─────────────────────────────────── */
function StepIdentidad({ data, up, onLogo, refState, handleRefUrl, applyRefColor }) {
  return (
    <div className="ob-step">
      <div className="ob-step-head">
        <h2 className="ob-step-title">Identidad visual</h2>
        <p className="ob-step-desc">Personaliza los colores, tipografía y logo de tu web.</p>
      </div>

      <div className="ob-section">
        <SectionHead icon={IconUpload} title="Logo" />
        <div className="ob-logo-area">
          {data.logoPreview ? (
            <div className="ob-logo-preview-wrap">
              <img src={data.logoPreview} alt="logo" />
              <button onClick={() => up('logoPreview', '')}><IconX size={13} /></button>
            </div>
          ) : (
            <label className="ob-upload-btn">
              <input type="file" accept="image/*" onChange={onLogo} hidden />
              <IconUpload size={22} />
              <span>Subir logo</span>
              <small>PNG, SVG, JPG — hasta 2 MB</small>
            </label>
          )}
        </div>
      </div>

      <div className="ob-section">
        <SectionHead icon={IconExternalLink} title="Webs de referencia" />
        <p className="ob-hint" style={{ marginBottom: 14 }}>
          ¿Hay alguna web que te guste como referencia? Extraemos su paleta de colores automáticamente.
        </p>
        <div className="ob-ref-list">
          {[0, 1, 2].map(i => (
            <div key={i} className="ob-ref-row">
              <div className="ob-ref-input-wrap">
                <IconWorld size={14} className="ob-ref-icon" />
                <input
                  type="text"
                  placeholder={`URL referencia ${i + 1} (ej: apple.com)`}
                  value={data.referenceUrls[i]}
                  onChange={e => handleRefUrl(i, e.target.value)}
                  className="ob-ref-input"
                />
                {refState[i].loading && <IconLoader2 size={14} className="ob-ref-spin" />}
              </div>
              {refState[i].colors.length > 0 && (
                <div className="ob-ref-colors">
                  <span className="ob-ref-colors-label">Colores extraídos — haz clic para aplicar:</span>
                  <div className="ob-ref-swatches">
                    {refState[i].colors.map((c, j) => (
                      <button
                        key={j}
                        className={`ob-ref-swatch${data.primaryColor === c ? ' active' : ''}`}
                        style={{ background: c }}
                        title={c}
                        onClick={() => applyRefColor(c)}
                      >
                        {data.primaryColor === c && <IconCheck size={10} />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="ob-section">
        <SectionHead icon={IconPalette} title="Colores corporativos" />
        <div className="ob-colors-row">
          {[
            { key: 'primaryColor',   label: 'Color principal'  },
            { key: 'secondaryColor', label: 'Color secundario' },
          ].map(c => (
            <div key={c.key} className="ob-color-picker">
              <label>{c.label}</label>
              <div className="ob-color-inputs">
                <input type="color" value={data[c.key]} onChange={e => up(c.key, e.target.value)} />
                <input type="text"  value={data[c.key]} onChange={e => up(c.key, e.target.value)} maxLength={7} className="ob-hex" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="ob-section">
        <SectionHead icon={IconTypography} title="Tipografía" />
        <div className="ob-fonts-grid">
          {FONT_PAIRS.map(f => (
            <div
              key={f.id}
              className={`ob-font-card${data.fontPair === f.id ? ' selected' : ''}`}
              style={{ fontFamily: f.css }}
              onClick={() => up('fontPair', f.id)}
            >
              {data.fontPair === f.id && <div className="ob-font-check"><IconCheck size={11} /></div>}
              <div className="ob-font-sample">Aa Bb Cc</div>
              <div className="ob-font-name">{f.name}</div>
              <div className="ob-font-sub">{f.subtitle}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── STEP 4 — CONTENIDO ─────────────────────────────────── */
function StepContenido({ data, up, gen, generate,
  addSvc, rmSvc, upSvc, svcPhoto,
  onHero, onGallery, rmGallery,
  addTeam, rmTeam, upTeam, teamPhoto,
  addTest, rmTest, upTest,
  addFaq, rmFaq, upFaq, toggleLang }) {
  return (
    <div className="ob-step">
      <div className="ob-step-head">
        <h2 className="ob-step-title">Contenido de tu web</h2>
        <p className="ob-step-desc">Textos, fotos y servicios. La IA te ayuda a escribir en segundos.</p>
      </div>

      <div className="ob-section">
        <SectionHead icon={IconFileText} title="Textos principales" />
        <div className="ob-fields">
          <div className="ob-field ob-full">
            <div className="ob-label-row">
              <label>Título principal de la web</label>
              <AiBtn field="heroTitle" gen={gen} generate={generate} />
            </div>
            <input type="text" value={data.heroTitle} onChange={e => up('heroTitle', e.target.value)} placeholder="Ej: La mejor clínica dental de Madrid" />
          </div>
          <div className="ob-field ob-full">
            <div className="ob-label-row">
              <label>Descripción corta</label>
              <AiBtn field="description" gen={gen} generate={generate} />
            </div>
            <textarea rows={3} value={data.description} onChange={e => up('description', e.target.value)} placeholder="Una frase que resume lo que haces y por qué eres diferente…" />
          </div>
          <div className="ob-field ob-full">
            <div className="ob-label-row">
              <label>Historia / Sobre nosotros</label>
              <AiBtn field="about" gen={gen} generate={generate} />
            </div>
            <textarea rows={4} value={data.about} onChange={e => up('about', e.target.value)} placeholder="Cuéntanos tu historia, tus valores, por qué empezaste…" />
          </div>
        </div>
      </div>

      <div className="ob-section">
        <SectionHead icon={IconPhoto} title="Foto de portada (hero)" />
        {data.heroPhotoPreview ? (
          <div className="ob-hero-preview">
            <img src={data.heroPhotoPreview} alt="hero" />
            <button onClick={() => up('heroPhotoPreview', '')}><IconX size={14} /></button>
          </div>
        ) : (
          <label className="ob-upload-btn ob-upload-hero">
            <input type="file" accept="image/*" onChange={onHero} hidden />
            <IconPhoto size={26} />
            <span>Subir foto de portada</span>
            <small>Banner principal de tu web · Mín. 1200×600px recomendado</small>
          </label>
        )}
      </div>

      <div className="ob-section">
        <SectionHead
          icon={IconBriefcase} title="Servicios / Productos"
          count={data.services.length} max={10}
          action={data.services.length < 10 && <button className="ob-add-btn" onClick={addSvc}><IconPlus size={13} /> Añadir</button>}
        />
        <div className="ob-services-list">
          {data.services.map((s, i) => (
            <div key={s.id} className="ob-service-card">
              <div className="ob-service-top">
                <span className="ob-service-num">{i + 1}</span>
                <div className="ob-service-photo-slot">
                  {s.photoPreview ? (
                    <div className="ob-svc-img">
                      <img src={s.photoPreview} alt="" />
                      <button onClick={() => upSvc(s.id, 'photoPreview', '')}><IconX size={10} /></button>
                    </div>
                  ) : (
                    <label className="ob-svc-img-btn">
                      <input type="file" accept="image/*" onChange={e => svcPhoto(s.id, e)} hidden />
                      <IconPhoto size={14} />
                    </label>
                  )}
                </div>
                {data.services.length > 1 && (
                  <button className="ob-icon-btn" onClick={() => rmSvc(s.id)}><IconTrash size={14} /></button>
                )}
              </div>
              <div className="ob-service-fields">
                <input type="text" placeholder="Nombre del servicio *" value={s.name} onChange={e => upSvc(s.id, 'name', e.target.value)} />
                <input type="text" placeholder="Precio (ej: 50€)" value={s.price} onChange={e => upSvc(s.id, 'price', e.target.value)} />
                <input type="text" placeholder="Descripción breve" value={s.description} onChange={e => upSvc(s.id, 'description', e.target.value)} className="ob-span2" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="ob-section">
        <SectionHead
          icon={IconPhoto} title="Galería de fotos"
          count={data.galleryPreviews.length} max={12}
          action={data.galleryPreviews.length < 12 && (
            <label className="ob-add-btn">
              <input type="file" accept="image/*" multiple onChange={onGallery} hidden />
              <IconPlus size={13} /> Añadir fotos
            </label>
          )}
        />
        {data.galleryPreviews.length === 0
          ? <p className="ob-hint">Sube hasta 12 fotos de tu espacio, equipo o productos.</p>
          : (
            <div className="ob-gallery-grid">
              {data.galleryPreviews.map((p, i) => (
                <div key={i} className="ob-gallery-thumb">
                  <img src={p} alt="" />
                  <button onClick={() => rmGallery(i)}><IconX size={11} /></button>
                </div>
              ))}
            </div>
          )
        }
      </div>

      <div className="ob-section">
        <SectionHead
          icon={IconUsers} title="Nuestro equipo"
          count={data.team.length} max={6}
          action={data.team.length < 6 && <button className="ob-add-btn" onClick={addTeam}><IconPlus size={13} /> Añadir persona</button>}
        />
        {data.team.length === 0 && <p className="ob-hint">Opcional — presenta a tu equipo para generar confianza.</p>}
        <div className="ob-team-grid">
          {data.team.map(m => (
            <div key={m.id} className="ob-team-card">
              <div className="ob-team-photo">
                {m.photoPreview ? (
                  <div className="ob-team-img">
                    <img src={m.photoPreview} alt="" />
                    <button onClick={() => upTeam(m.id, 'photoPreview', '')}><IconX size={10} /></button>
                  </div>
                ) : (
                  <label className="ob-team-img-btn">
                    <input type="file" accept="image/*" onChange={e => teamPhoto(m.id, e)} hidden />
                    <IconUser size={22} />
                  </label>
                )}
              </div>
              <div className="ob-team-fields">
                <input type="text" placeholder="Nombre completo" value={m.name} onChange={e => upTeam(m.id, 'name', e.target.value)} />
                <input type="text" placeholder="Cargo / Especialidad" value={m.role} onChange={e => upTeam(m.id, 'role', e.target.value)} />
              </div>
              <button className="ob-icon-btn" onClick={() => rmTeam(m.id)}><IconTrash size={14} /></button>
            </div>
          ))}
        </div>
      </div>

      <div className="ob-section">
        <SectionHead
          icon={IconStar} title="Testimonios"
          count={data.testimonials.length} max={5}
          action={
            <div className="ob-actions-row">
              <button className="ob-ghost-btn" onClick={() => alert('Próximamente: importar desde Google My Business')}>
                <IconBrandGoogle size={13} /> Importar de Google
              </button>
              {data.testimonials.length < 5 && <button className="ob-add-btn" onClick={addTest}><IconPlus size={13} /> Añadir</button>}
            </div>
          }
        />
        {data.testimonials.length === 0 && <p className="ob-hint">Opcional — los testimonios reales aumentan la conversión.</p>}
        <div className="ob-test-list">
          {data.testimonials.map(t => (
            <div key={t.id} className="ob-test-card">
              <div className="ob-test-top">
                <input type="text" placeholder="Nombre del cliente" value={t.name} onChange={e => upTest(t.id, 'name', e.target.value)} className="ob-test-name" />
                <div className="ob-stars">
                  {[1,2,3,4,5].map(n => (
                    <button key={n} className={`ob-star${n <= t.rating ? ' on' : ''}`} onClick={() => upTest(t.id, 'rating', n)}>
                      <IconStar size={15} />
                    </button>
                  ))}
                </div>
                <button className="ob-icon-btn" onClick={() => rmTest(t.id)}><IconTrash size={14} /></button>
              </div>
              <textarea rows={2} placeholder="Texto del testimonio…" value={t.text} onChange={e => upTest(t.id, 'text', e.target.value)} />
            </div>
          ))}
        </div>
      </div>

      <div className="ob-section">
        <SectionHead
          icon={IconHelp} title="Preguntas frecuentes"
          count={data.faqs.length} max={8}
          action={
            <div className="ob-actions-row">
              <AiBtn field="faqs" gen={gen} generate={generate} />
              {data.faqs.length < 8 && <button className="ob-add-btn" onClick={addFaq}><IconPlus size={13} /> Añadir</button>}
            </div>
          }
        />
        {data.faqs.length === 0 && <p className="ob-hint">Opcional — responde las dudas más comunes.</p>}
        <div className="ob-faqs-list">
          {data.faqs.map((f, i) => (
            <div key={f.id} className="ob-faq-item">
              <div className="ob-faq-top">
                <span className="ob-faq-num">P{i + 1}</span>
                <button className="ob-icon-btn" onClick={() => rmFaq(f.id)}><IconTrash size={14} /></button>
              </div>
              <input type="text" placeholder="Pregunta frecuente" value={f.question} onChange={e => upFaq(f.id, 'question', e.target.value)} />
              <textarea rows={2} placeholder="Respuesta" value={f.answer} onChange={e => upFaq(f.id, 'answer', e.target.value)} />
            </div>
          ))}
        </div>
      </div>

      <div className="ob-section">
        <SectionHead icon={IconMapPin} title="Zona de cobertura" />
        <div className="ob-fields">
          <div className="ob-field ob-full">
            <input type="text" value={data.coverageArea} onChange={e => up('coverageArea', e.target.value)} placeholder="Ej: Madrid, Alcobendas, Pozuelo de Alarcón…" />
          </div>
        </div>
      </div>

      <div className="ob-section">
        <SectionHead icon={IconAward} title="Certificaciones y premios" />
        <div className="ob-fields">
          <div className="ob-field ob-full">
            <textarea rows={2} value={data.certifications} onChange={e => up('certifications', e.target.value)} placeholder="Ej: Colegio de Médicos, ISO 9001, Premio Best Clinic 2024…" />
          </div>
        </div>
      </div>

      <div className="ob-section">
        <SectionHead icon={IconLanguage} title="Idiomas del servicio" />
        <div className="ob-lang-chips">
          {LANGUAGES.map(lang => (
            <button
              key={lang}
              className={`ob-lang-chip${data.languages.includes(lang) ? ' on' : ''}`}
              onClick={() => toggleLang(lang)}
            >
              {data.languages.includes(lang) && <IconCheck size={10} />}
              {lang}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── STEP 5 — SEO ───────────────────────────────────────── */
function StepSeo({ data, up, gen, generate }) {
  return (
    <div className="ob-step">
      <div className="ob-step-head">
        <h2 className="ob-step-title">SEO y configuración</h2>
        <p className="ob-step-desc">Optimiza tu web para Google y activa las funcionalidades finales.</p>
      </div>

      <div className="ob-section">
        <SectionHead icon={IconSearch} title="Posicionamiento en Google (SEO)" />
        <div className="ob-fields">
          <div className="ob-field ob-full">
            <div className="ob-label-row">
              <label>Título SEO <span className="ob-char-count">{data.seoTitle.length}/60</span></label>
              <AiBtn field="seoTitle" gen={gen} generate={generate} />
            </div>
            <input type="text" value={data.seoTitle} onChange={e => up('seoTitle', e.target.value)} placeholder="Ej: Clínica Dental García | Odontología en Madrid" maxLength={60} />
          </div>
          <div className="ob-field ob-full">
            <div className="ob-label-row">
              <label>Meta descripción <span className="ob-char-count">{data.seoDescription.length}/155</span></label>
              <AiBtn field="seoDescription" gen={gen} generate={generate} />
            </div>
            <textarea rows={2} value={data.seoDescription} onChange={e => up('seoDescription', e.target.value)} placeholder="Descripción que aparece en Google (máx. 155 caracteres)" maxLength={155} />
          </div>
          <div className="ob-field ob-full">
            <label>Palabra clave principal</label>
            <input type="text" value={data.seoKeyword} onChange={e => up('seoKeyword', e.target.value)} placeholder="Ej: clínica dental Madrid" />
          </div>
        </div>
      </div>

      <div className="ob-section">
        <SectionHead icon={IconWorld} title="Dominio" />
        <div className="ob-domain-toggle">
          {[
            { val: 'new',      Icon: IconSearch, label: 'Quiero comprar un dominio' },
            { val: 'existing', Icon: IconLink,   label: 'Ya tengo dominio'          },
          ].map(opt => (
            <label key={opt.val} className={`ob-domain-opt${data.domainOption === opt.val ? ' selected' : ''}`}>
              <input type="radio" name="domain" value={opt.val} checked={data.domainOption === opt.val} onChange={() => up('domainOption', opt.val)} hidden />
              <opt.Icon size={16} />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
        {data.domainOption === 'new' && (
          <div className="ob-field ob-mt12">
            <label>Buscar disponibilidad</label>
            <div className="ob-domain-search">
              <input type="text" value={data.domainSearch} onChange={e => up('domainSearch', e.target.value)} placeholder="tunegocio" />
              <span className="ob-domain-ext">.com</span>
              <button className="ob-domain-check"><IconSearch size={14} /></button>
            </div>
          </div>
        )}
        {data.domainOption === 'existing' && (
          <div className="ob-field ob-mt12">
            <label>Tu dominio</label>
            <input type="text" value={data.domainExisting} onChange={e => up('domainExisting', e.target.value)} placeholder="https://www.tunegocio.com" />
          </div>
        )}
      </div>

      <div className="ob-section">
        <SectionHead icon={IconChartBar} title="Analytics y seguimiento" />
        <div className="ob-fields">
          <div className="ob-field">
            <label>Google Analytics ID</label>
            <input type="text" value={data.gaId} onChange={e => up('gaId', e.target.value)} placeholder="G-XXXXXXXXXX" />
          </div>
          <div className="ob-field">
            <label>Facebook Pixel ID</label>
            <input type="text" value={data.fbPixel} onChange={e => up('fbPixel', e.target.value)} placeholder="123456789012345" />
          </div>
        </div>
      </div>

      <div className="ob-section">
        <SectionHead icon={IconSettings} title="Funcionalidades" />
        <div className="ob-toggles">
          <Toggle enabled={data.whatsappEnabled} onToggle={() => up('whatsappEnabled', !data.whatsappEnabled)} icon={IconBrandWhatsapp} label="Botón de WhatsApp flotante">
            <input type="tel" value={data.whatsappNumber} onChange={e => up('whatsappNumber', e.target.value)} placeholder="34612345678 (sin + ni espacios)" className="ob-toggle-input" />
          </Toggle>
          <Toggle enabled={data.chatEnabled}    onToggle={() => up('chatEnabled',    !data.chatEnabled)}    icon={IconMessage} label="Chat en vivo" />
          <Toggle enabled={data.cookieEnabled}  onToggle={() => up('cookieEnabled',  !data.cookieEnabled)}  icon={IconShield}  label="Banner de cookies (RGPD)" />
        </div>
      </div>

      <div className="ob-section">
        <SectionHead
          icon={IconShield} title="Política de privacidad"
          action={<AiBtn field="privacyPolicy" gen={gen} generate={generate} />}
        />
        {data.privacyPolicy
          ? <textarea rows={8} value={data.privacyPolicy} onChange={e => up('privacyPolicy', e.target.value)} className="ob-privacy-ta" />
          : <p className="ob-hint">Pulsa "Generar con IA" para crear la política de privacidad basada en los datos de tu negocio.</p>
        }
      </div>
    </div>
  );
}
