import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Download, Mail, Move, Palette, Shirt, Upload, X,
  RotateCcw, Maximize2, CheckCircle2, Info, Type,
} from 'lucide-react';
import MockupCanvas from '../components/MockupCanvas';
import ChatBot from '../components/ChatBot';
import useSeo from '../hooks/useSeo';
import { submitDesignRequest, ApiError } from '../lib/api';
import site, { mailtoQuote } from '../data/site';
import { GARMENT_COLORS as COLORS } from '../data/catalog';

const PRODUCTS = [
  { id: 'tshirt', name: 'T-Shirt', detail: 'Gildan Softstyle 64000', icon: '👕' },
  { id: 'hoodie', name: 'Hoodie', detail: 'Gildan Heavy Blend 18500', icon: '🧥' },
  { id: 'polo', name: 'Polo', detail: 'M&O Ring-Spun Piqué 7002', icon: '👔' },
];


// Artwork and the rendered mockup are sent together in one JSON body, and the
// host rejects anything over 4.5 MB. Base64 adds a third, so cap the source here.
const MAX_ARTWORK_BYTES = 2.5 * 1024 * 1024;

const FONTS = [
  { name: 'Classic Sans', value: 'Arial, sans-serif' },
  { name: 'Clean Sans', value: 'Helvetica Neue, Helvetica, Arial, sans-serif' },
  { name: 'Humanist Sans', value: 'Verdana, Geneva, sans-serif' },
  { name: 'Geometric Sans', value: 'Century Gothic, Futura, sans-serif' },
  { name: 'Modern Rounded', value: 'Trebuchet MS, sans-serif' },
  { name: 'Friendly Rounded', value: 'Arial Rounded MT Bold, Arial, sans-serif' },
  { name: 'Editorial Serif', value: 'Georgia, serif' },
  { name: 'Classic Serif', value: 'Times New Roman, Times, serif' },
  { name: 'Book Serif', value: 'Palatino Linotype, Book Antiqua, Palatino, serif' },
  { name: 'Bold Display', value: 'Impact, sans-serif' },
  { name: 'Condensed Display', value: 'Arial Narrow, Arial, sans-serif' },
  { name: 'Western Display', value: 'Copperplate, Papyrus, fantasy' },
  { name: 'Monospace', value: 'Courier New, monospace' },
  { name: 'Script', value: 'Brush Script MT, cursive' },
  { name: 'Other — request a font', value: 'other' },
];

const APPAREL_PLACEMENTS = {
  front: [
    { id: 'full-front', name: 'Full front', inchesWidth: 12, inchesHeight: 16, x: 50, y: 55, width: 38, height: 45 },
    { id: 'center-chest', name: 'Center chest', inchesWidth: 10, inchesHeight: 12, x: 50, y: 42, width: 32, height: 30 },
    { id: 'left-chest', name: 'Left chest', inchesWidth: 4, inchesHeight: 4, x: 61, y: 36, width: 14, height: 14 },
    { id: 'right-chest', name: 'Right chest', inchesWidth: 4, inchesHeight: 4, x: 39, y: 36, width: 14, height: 14 },
    { id: 'left-sleeve', name: 'Left sleeve', inchesWidth: 4, inchesHeight: 4, x: 82, y: 37, width: 12, height: 16 },
  ],
  back: [
    { id: 'full-back', name: 'Full back', inchesWidth: 12, inchesHeight: 16, x: 50, y: 55, width: 38, height: 45 },
    { id: 'upper-back', name: 'Upper back', inchesWidth: 12, inchesHeight: 4, x: 50, y: 31, width: 38, height: 12 },
    { id: 'back-neck', name: 'Back neck', inchesWidth: 4, inchesHeight: 2, x: 50, y: 22, width: 14, height: 7 },
  ],
};

function placementsFor(product, side) {
  return APPAREL_PLACEMENTS[side];
}

function placementFor(product, side, id) {
  return placementsFor(product, side).find((placement) => placement.id === id) ?? placementsFor(product, side)[0];
}

function titleCase(value) {
  return value.replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatNumber(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function formatDimensions(width, height) {
  return `${formatNumber(width)} × ${formatNumber(height)} in (${formatNumber(width * 2.54)} × ${formatNumber(height * 2.54)} cm)`;
}

function toInches(value, unit) {
  return unit === 'cm' ? value / 2.54 : value;
}

function fromInches(value, unit) {
  return unit === 'cm' ? value * 2.54 : value;
}

function isValidDimension(value) {
  return Number.isFinite(value) && value >= 0.5 && value <= 24;
}

export default function DesignStudio() {
  const fileInputRef = useRef(null);
  const mockupRef = useRef(null);
  const [product, setProduct] = useState('tshirt');
  const [side, setSide] = useState('front');
  const [placementId, setPlacementId] = useState('full-front');
  const [garmentColor, setGarmentColor] = useState('#ffffff');
  const [designImage, setDesignImage] = useState(null);
  const [designFileName, setDesignFileName] = useState('');
  const [position, setPosition] = useState({ x: 50, y: 55 });
  const [designScale, setDesignScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [textValue, setTextValue] = useState('');
  const [textFont, setTextFont] = useState(FONTS[0].value);
  const [fontRequest, setFontRequest] = useState('');
  const [textColor, setTextColor] = useState('#111827');
  // Until someone picks a colour deliberately, keep the text legible against
  // whatever garment they are looking at.
  const [textColorPinned, setTextColorPinned] = useState(false);
  const [textSize, setTextSize] = useState(42);
  const [textPosition, setTextPosition] = useState({ x: 50, y: 55 });
  const [activeLayer, setActiveLayer] = useState('art');
  const [sizeMode, setSizeMode] = useState('standard');
  const [sizeUnit, setSizeUnit] = useState('in');
  const [customSize, setCustomSize] = useState({ width: '', height: '' });
  const [showSpecialtyDialog, setShowSpecialtyDialog] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [requestState, setRequestState] = useState({ status: 'idle', error: '', reference: '' });
  const [contact, setContact] = useState({ name: '', email: '', phone: '', organization: '', quantity: '', notes: '' });

  useSeo({
    title: 'Design Studio — preview your custom apparel',
    description: 'Upload your logo or add text, pick a garment and colour, and see a production-accurate mockup you can download or send to us for a quote.',
    path: '/design-studio',
  });

  const placement = placementFor(product, side, placementId);
  const selectedColor = COLORS.find((color) => color.value === garmentColor);
  const customWidth = toInches(Number(customSize.width), sizeUnit);
  const customHeight = toInches(Number(customSize.height), sizeUnit);
  const useCustomSize = sizeMode === 'custom' && isValidDimension(customWidth) && isValidDimension(customHeight);
  const activeDimensions = useCustomSize
    ? { width: customWidth, height: customHeight }
    : { width: placement.inchesWidth, height: placement.inchesHeight };
  const designArea = {
    ...placement,
    size: formatDimensions(activeDimensions.width, activeDimensions.height),
    width: useCustomSize ? Math.min(72, Math.max(8, placement.width * (activeDimensions.width / placement.inchesWidth))) : placement.width,
    height: useCustomSize ? Math.min(72, Math.max(7, placement.height * (activeDimensions.height / placement.inchesHeight))) : placement.height,
  };
  const hasDesign = Boolean(designImage || textValue.trim());

  const selectSizeMode = (nextMode) => {
    setSizeMode(nextMode);
    if (nextMode === 'custom' && (!customSize.width || !customSize.height)) {
      setCustomSize({
        width: String(formatNumber(fromInches(placement.inchesWidth, sizeUnit))),
        height: String(formatNumber(fromInches(placement.inchesHeight, sizeUnit))),
      });
    }
  };

  const changeSizeUnit = (nextUnit) => {
    if (nextUnit === sizeUnit) return;
    const factor = nextUnit === 'cm' ? 2.54 : 1 / 2.54;
    setCustomSize((current) => ({
      width: current.width ? String(formatNumber(Number(current.width) * factor)) : '',
      height: current.height ? String(formatNumber(Number(current.height) * factor)) : '',
    }));
    setSizeUnit(nextUnit);
  };

  const chooseProduct = (nextProduct) => {
    setProduct(nextProduct);
    setSide('front');
    const nextPlacement = placementsFor(nextProduct, 'front')[0];
    setPlacementId(nextPlacement.id);
    setPosition({ x: nextPlacement.x, y: nextPlacement.y });
    setTextPosition({ x: nextPlacement.x, y: nextPlacement.y });
  };

  const chooseSide = (nextSide) => {
    setSide(nextSide);
    const nextPlacement = placementsFor(product, nextSide)[0];
    setPlacementId(nextPlacement.id);
    setPosition({ x: nextPlacement.x, y: nextPlacement.y });
    setTextPosition({ x: nextPlacement.x, y: nextPlacement.y });
  };

  const choosePlacement = (nextPlacementId) => {
    const nextPlacement = placementFor(product, side, nextPlacementId);
    setPlacementId(nextPlacement.id);
    const nextPosition = { x: nextPlacement.x, y: nextPlacement.y };
    if (activeLayer === 'text') setTextPosition(nextPosition);
    else setPosition(nextPosition);
  };

  const chooseGarmentColor = (nextColor) => {
    setGarmentColor(nextColor);
    if (textColorPinned) return;
    const isDark = COLORS.find((color) => color.value === nextColor)?.dark;
    setTextColor(isDark ? '#ffffff' : '#111827');
  };

  const uploadArtwork = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_ARTWORK_BYTES) {
      setRequestState({
        status: 'idle',
        error: `Please use an artwork file under ${MAX_ARTWORK_BYTES / (1024 * 1024)} MB. Email us the print-ready file separately if it is larger.`,
        reference: '',
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setDesignImage(reader.result);
      setDesignFileName(file.name);
      setActiveLayer('art');
      setRequestState({ status: 'idle', error: '', reference: '' });
    };
    reader.readAsDataURL(file);
  };

  const resetArtwork = () => {
    setDesignImage(null);
    setDesignFileName('');
    setDesignScale(1);
    setRotation(0);
    setPosition({ x: placement.x, y: placement.y });
    if (textValue.trim()) setActiveLayer('text');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const exportDesign = async () => {
    if (!hasDesign || !mockupRef.current) return;
    const imageUrl = await mockupRef.current.toDataUrl();
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `deed-leisure-${product}-${side}-mockup.png`;
    link.click();
  };

  const openRequest = () => {
    setRequestState({ status: 'idle', error: '', reference: '' });
    setShowRequestDialog(true);
  };

  const submitRequest = async (event) => {
    event.preventDefault();
    if (!mockupRef.current || !hasDesign) return;
    setRequestState({ status: 'sending', error: '', reference: '' });
    try {
      // JPEG for the email: a fraction of the PNG's size, indistinguishable at
      // review scale. The Export button still hands the customer a PNG.
      const mockupDataUrl = await mockupRef.current.toDataUrl({ format: 'image/jpeg' });
      const result = await submitDesignRequest({
        contact,
        design: {
          product: PRODUCTS.find((item) => item.id === product)?.name ?? product,
          color: selectedColor?.name ?? garmentColor,
          side: titleCase(side),
          placement: `${placement.name} (${useCustomSize ? 'custom: ' : 'up to '}${designArea.size})`,
          text: textValue.trim(),
          font: textFont === 'other'
            ? `Requested font: ${fontRequest.trim() || 'Not specified'}`
            : FONTS.find((font) => font.value === textFont)?.name ?? textFont,
          mockupDataUrl,
          artworkDataUrl: designImage,
        },
      });
      setRequestState({ status: 'success', error: '', reference: result.reference });
    } catch (error) {
      setRequestState({
        status: 'idle',
        error: error.message || 'Unable to send your request. Please try again.',
        reference: '',
        // A 503 means email delivery is not switched on. Rather than lose the
        // enquiry, offer the visitor their own mail client with the details.
        offerMailto: error instanceof ApiError && error.fallback === 'mailto',
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <Link to="/" aria-label="Back to home" className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-primary"><ArrowLeft className="h-5 w-5" /></Link>
            <div>
              <h1 className="text-xl font-bold sm:text-2xl">Design Studio</h1>
              <p className="hidden text-xs text-slate-500 sm:block">2D placement preview for custom apparel</p>
            </div>
          </div>
          <button onClick={exportDesign} disabled={!hasDesign} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40 sm:px-4">
            <Download className="h-4 w-4" /> <span className="hidden sm:inline">Export mockup</span><span className="sm:hidden">Export</span>
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-7 lg:py-10">
        <div className="mb-7 max-w-3xl">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"><Info className="h-3.5 w-3.5" /> Industry-standard decoration guides</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Build a mockup that your production team can approve.</h2>
          <p className="mt-2 text-slate-600">Choose a standard print or embroidery placement, then drag your art for the final adjustment. The same placement guidelines apply to both decoration methods.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="order-2 space-y-5 lg:order-1">
            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h3 className="flex items-center gap-2 font-semibold"><Upload className="h-5 w-5 text-primary" /> Your artwork</h3>
              <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/svg+xml" onChange={uploadArtwork} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="mt-4 flex h-28 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 text-sm transition hover:border-primary hover:bg-primary/5">
                <Upload className="mb-2 h-6 w-6 text-slate-400" />
                <span className="font-medium text-slate-700">Upload artwork</span>
                <span className="mt-1 text-xs text-slate-500">PNG, JPG, or SVG · 2.5 MB maximum</span>
              </button>
              {designImage ? (
                <div className="mt-3 flex items-center gap-3 rounded-lg bg-slate-50 p-2">
                  <img src={designImage} alt="Uploaded artwork" className="h-12 w-12 rounded bg-white object-contain p-1" />
                  <p className="min-w-0 flex-1 truncate text-sm text-slate-600">{designFileName}</p>
                  <button onClick={resetArtwork} className="rounded p-1.5 text-slate-500 hover:bg-white hover:text-red-600" aria-label="Remove artwork"><X className="h-4 w-4" /></button>
                </div>
              ) : null}
              {requestState.error && !showRequestDialog ? <p className="mt-3 text-sm text-red-600">{requestState.error}</p> : null}
            </section>

            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h3 className="flex items-center gap-2 font-semibold"><Type className="h-5 w-5 text-primary" /> Add text</h3>
              <label className="mt-4 block text-sm font-medium text-slate-700" htmlFor="design-text">Your text</label>
              <textarea id="design-text" value={textValue} maxLength="120" rows="2" onChange={(event) => { setTextValue(event.target.value); setActiveLayer('text'); }} placeholder="Add a name, slogan, team, or date" className="mt-2 w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <div className="mt-4 grid grid-cols-[minmax(0,1fr)_54px] gap-3">
                <label className="min-w-0 text-sm font-medium text-slate-700" htmlFor="text-font">Font<select id="text-font" value={textFont} onChange={(event) => { setTextFont(event.target.value); setActiveLayer('text'); }} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">{FONTS.map((font) => <option key={font.value} value={font.value}>{font.name}</option>)}</select></label>
                <label className="text-sm font-medium text-slate-700" htmlFor="text-color">Colour<input id="text-color" type="color" value={textColor} onChange={(event) => { setTextColor(event.target.value); setTextColorPinned(true); setActiveLayer('text'); }} className="mt-2 h-[42px] w-full cursor-pointer rounded-lg border border-slate-300 bg-white p-1" /></label>
              </div>
              {textFont === 'other' ? <div className="mt-3"><label className="block text-sm font-medium text-slate-700" htmlFor="font-request">Requested font<input id="font-request" value={fontRequest} onChange={(event) => setFontRequest(event.target.value)} placeholder="e.g. Montserrat Alternates" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" /></label><p className="mt-1.5 text-xs text-slate-500">This preview uses a fallback font. We’ll source the requested font for production, subject to availability and licensing.</p></div> : null}
              {textValue ? <button type="button" onClick={() => { setTextValue(''); setTextPosition({ x: placement.x, y: placement.y }); }} className="mt-3 text-xs font-medium text-red-600 hover:text-red-700">Remove text</button> : null}
            </section>

            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h3 className="flex items-center gap-2 font-semibold"><Shirt className="h-5 w-5 text-primary" /> Choose a product</h3>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {PRODUCTS.map((item) => (
                  <button key={item.id} onClick={() => chooseProduct(item.id)} className={`rounded-xl border-2 p-3 text-left transition ${product === item.id ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-slate-300'}`}>
                    <span className="text-2xl" aria-hidden="true">{item.icon}</span>
                    <span className="mt-1 block text-sm font-semibold">{item.name}</span>
                    <span className="block text-[11px] leading-tight text-slate-500">{item.detail}</span>
                  </button>
                ))}
                <button onClick={() => setShowSpecialtyDialog(true)} className="rounded-xl border-2 border-dashed border-slate-300 p-3 text-left transition hover:border-primary hover:bg-primary/5">
                  <span className="text-2xl" aria-hidden="true">🧢</span>
                  <span className="mt-1 block text-sm font-semibold">Hats &amp; bags</span>
                  <span className="block text-[11px] leading-tight text-slate-500">Request a guided mockup</span>
                </button>
              </div>
            </section>

            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h3 className="flex items-center gap-2 font-semibold"><Palette className="h-5 w-5 text-primary" /> Garment colour</h3>
              <div className="mt-4 grid grid-cols-4 gap-3">
                {COLORS.map((color) => (
                  <button key={color.value} onClick={() => chooseGarmentColor(color.value)} title={color.name} aria-label={color.name} className={`relative aspect-square rounded-full border-2 transition ${garmentColor === color.value ? 'scale-110 border-primary ring-2 ring-primary/20' : 'border-slate-300 hover:scale-105'}`} style={{ backgroundColor: color.value }}>
                    {garmentColor === color.value ? <span className={`absolute inset-0 grid place-items-center text-sm ${color.dark ? 'text-white' : 'text-slate-800'}`}>✓</span> : null}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs text-slate-500">{selectedColor?.name}. Colours are rendered onto the real product photo, so folds, seams, and shadows stay true. On-screen colour is indicative — ask us for a fabric swatch before a large run.</p>
            </section>

            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h3 className="flex items-center gap-2 font-semibold"><Move className="h-5 w-5 text-primary" /> Placement & adjustment</h3>
              <div className="mt-4 flex rounded-lg bg-slate-100 p-1">
                {['front', 'back'].map((option) => <button key={option} onClick={() => chooseSide(option)} className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${side === option ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{titleCase(option)}</button>)}
              </div>
              <label className="mt-4 block text-sm font-medium text-slate-700" htmlFor="placement">Standard placement</label>
              <select id="placement" value={placementId} onChange={(event) => choosePlacement(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
                {placementsFor(product, side).map((option) => <option key={option.id} value={option.id}>{option.name} — up to {formatDimensions(option.inchesWidth, option.inchesHeight)}</option>)}
              </select>
              <p className="mt-2 text-xs text-slate-500">Standard maximum: {formatDimensions(placement.inchesWidth, placement.inchesHeight)}</p>
              <div className="mt-4 flex rounded-lg bg-slate-100 p-1" aria-label="Artwork size mode">
                <button type="button" onClick={() => selectSizeMode('standard')} className={`flex-1 rounded-md px-2 py-2 text-xs font-semibold transition ${sizeMode === 'standard' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'}`}>Standard size</button>
                <button type="button" onClick={() => selectSizeMode('custom')} className={`flex-1 rounded-md px-2 py-2 text-xs font-semibold transition ${sizeMode === 'custom' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'}`}>Custom size</button>
              </div>
              {sizeMode === 'custom' ? <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3"><div className="flex items-center justify-between gap-3"><p className="text-xs font-semibold text-slate-700">Finished artwork size</p><div className="flex rounded-md bg-white p-0.5 ring-1 ring-slate-200"><button type="button" onClick={() => changeSizeUnit('in')} className={`rounded px-2 py-1 text-xs font-medium ${sizeUnit === 'in' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}>in</button><button type="button" onClick={() => changeSizeUnit('cm')} className={`rounded px-2 py-1 text-xs font-medium ${sizeUnit === 'cm' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}>cm</button></div></div><div className="mt-3 grid grid-cols-2 gap-2"><label className="text-xs font-medium text-slate-600" htmlFor="custom-width">Width<input id="custom-width" type="number" min="0.5" max={sizeUnit === 'cm' ? 61 : 24} step="0.1" inputMode="decimal" value={customSize.width} onChange={(event) => setCustomSize({ ...customSize, width: event.target.value })} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" /></label><label className="text-xs font-medium text-slate-600" htmlFor="custom-height">Height<input id="custom-height" type="number" min="0.5" max={sizeUnit === 'cm' ? 61 : 24} step="0.1" inputMode="decimal" value={customSize.height} onChange={(event) => setCustomSize({ ...customSize, height: event.target.value })} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" /></label></div><p className="mt-2 text-xs text-slate-500">{useCustomSize ? `Selected: ${designArea.size}` : 'Enter a size from 0.5 to 24 in (1.3 to 61 cm). Custom sizing requires production approval.'}</p></div> : null}
              {hasDesign ? <>
                {designImage && textValue ? <div className="mt-4 flex rounded-lg bg-slate-100 p-1"><button type="button" onClick={() => setActiveLayer('art')} className={`flex-1 rounded-md px-2 py-1.5 text-xs font-semibold ${activeLayer === 'art' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'}`}>Artwork</button><button type="button" onClick={() => setActiveLayer('text')} className={`flex-1 rounded-md px-2 py-1.5 text-xs font-semibold ${activeLayer === 'text' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'}`}>Text</button></div> : null}
                {activeLayer === 'art' && designImage ? <>
                <label className="mt-4 flex items-center justify-between text-sm text-slate-700" htmlFor="scale"><span className="flex items-center gap-2"><Maximize2 className="h-4 w-4" /> Artwork size</span><span>{Math.round(designScale * 100)}%</span></label>
                <input id="scale" className="mt-2 w-full accent-primary" type="range" min="60" max="120" value={designScale * 100} onChange={(event) => setDesignScale(Number(event.target.value) / 100)} />
                <label className="mt-4 flex items-center justify-between text-sm text-slate-700" htmlFor="rotation"><span>Rotation</span><span>{rotation}°</span></label>
                <div className="mt-2 flex gap-2"><input id="rotation" className="w-full accent-primary" type="range" min="-30" max="30" value={rotation} onChange={(event) => setRotation(Number(event.target.value))} /><button onClick={() => setRotation(0)} className="rounded-md border border-slate-200 px-2 text-xs font-medium hover:bg-slate-50" aria-label="Reset rotation"><RotateCcw className="h-4 w-4" /></button></div>
                </> : null}
                {activeLayer === 'text' && textValue ? <><label className="mt-4 flex items-center justify-between text-sm text-slate-700" htmlFor="text-size"><span className="flex items-center gap-2"><Maximize2 className="h-4 w-4" /> Text size</span><span>{textSize}px</span></label><input id="text-size" className="mt-2 w-full accent-primary" type="range" min="18" max="88" value={textSize} onChange={(event) => setTextSize(Number(event.target.value))} /></> : null}
              </> : null}
            </section>
          </aside>

          <section className="order-1 min-w-0 lg:order-2">
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div><h3 className="text-lg font-semibold">Photorealistic 2D preview</h3><p className="text-sm text-slate-500">{PRODUCTS.find((item) => item.id === product)?.name} · {titleCase(side)} · {placement.name} · {designArea.size}</p></div>
                <span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">Print & embroidery area</span>
              </div>
              <MockupCanvas ref={mockupRef} product={product} side={side} garmentColor={garmentColor} designImage={designImage} placement={designArea} position={position} designScale={designScale} rotation={rotation} textValue={textValue} textFont={textFont === 'other' ? FONTS[0].value : textFont} textColor={textColor} textSize={textSize} textPosition={textPosition} activeLayer={activeLayer} onPositionChange={setPosition} onTextPositionChange={setTextPosition} onActiveLayerChange={setActiveLayer} />
              <div className="mt-6 flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-600">{hasDesign ? 'Your mockup is ready to send for approval.' : 'Upload artwork or add text to see it on the garment.'}</p>
                <button onClick={openRequest} disabled={!hasDesign} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"><Mail className="h-4 w-4" /> Submit mockup request</button>
              </div>
            </div>
            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5 text-sm text-slate-700">
              <h4 className="font-semibold">Production guide</h4>
              <ul className="mt-2 space-y-1.5">
                <li>• Standard placement limits are shown in the dashed area; any custom drag is sent to the production team for approval.</li>
                <li>• Use a transparent PNG or SVG whenever possible. For raster art, start with artwork prepared at 300 DPI.</li>
                <li>• A submitted request is reviewed before production; colours and finished placement can vary slightly by garment and decoration method.</li>
              </ul>
            </div>
          </section>
        </div>
      </main>

      {showSpecialtyDialog ? <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4" role="dialog" aria-modal="true" aria-labelledby="specialty-title">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"><div className="flex items-start justify-between gap-4"><div><h3 id="specialty-title" className="text-xl font-bold">Hats, bags, and everything else</h3><p className="mt-2 text-slate-600">Curved and structured items — caps, beanies, totes, duffels — need a production check for panel seams and embroidery backing before we can show an accurate mockup. Send us your artwork and we’ll build one with you.</p></div><button onClick={() => setShowSpecialtyDialog(false)} className="rounded p-1 text-slate-500 hover:bg-slate-100" aria-label="Close"><X className="h-5 w-5" /></button></div><a href={mailtoQuote('Mockup request — hats, bags, or specialty items')} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 font-semibold text-white hover:bg-primary/90"><Mail className="h-4 w-4" /> Email {site.email}</a></div>
      </div> : null}

      {showRequestDialog ? <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 p-4 sm:grid sm:place-items-center" role="dialog" aria-modal="true" aria-labelledby="request-title">
        <div className="my-8 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl sm:my-0">
          {requestState.status === 'success' ? <div className="py-4 text-center"><CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" /><h3 className="mt-4 text-xl font-bold">Request sent</h3><p className="mt-2 text-slate-600">Your mockup is with our team. We reply with pricing within one business day. Keep this reference for follow-up:</p><p className="mt-3 font-mono text-lg font-bold text-primary">{requestState.reference}</p><button onClick={() => setShowRequestDialog(false)} className="mt-6 rounded-lg bg-slate-900 px-5 py-2.5 font-medium text-white hover:bg-slate-700">Done</button></div> : <>
            <div className="flex items-start justify-between gap-4"><div><h3 id="request-title" className="text-xl font-bold">Submit your mockup request</h3><p className="mt-1 text-sm text-slate-600">We’ll email the final preview and your details to the Deed Leisure team.</p></div><button onClick={() => setShowRequestDialog(false)} className="rounded p-1 text-slate-500 hover:bg-slate-100" aria-label="Close"><X className="h-5 w-5" /></button></div>
            <form className="mt-5 space-y-4" onSubmit={submitRequest}>
              <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium text-slate-700">Name<input required value={contact.name} onChange={(event) => setContact({ ...contact, name: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" /></label><label className="text-sm font-medium text-slate-700">Email<input type="email" required value={contact.email} onChange={(event) => setContact({ ...contact, email: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" /></label></div>
              <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium text-slate-700">Phone <span className="font-normal text-slate-400">(optional)</span><input value={contact.phone} onChange={(event) => setContact({ ...contact, phone: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" /></label><label className="text-sm font-medium text-slate-700">Organization <span className="font-normal text-slate-400">(optional)</span><input value={contact.organization} onChange={(event) => setContact({ ...contact, organization: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" /></label></div>
              <label className="block text-sm font-medium text-slate-700">Roughly how many pieces?<input required value={contact.quantity} onChange={(event) => setContact({ ...contact, quantity: event.target.value })} placeholder="Any quantity — there's no minimum" className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" /></label>
              <label className="block text-sm font-medium text-slate-700">Notes <span className="font-normal text-slate-400">(optional)</span><textarea rows="4" value={contact.notes} onChange={(event) => setContact({ ...contact, notes: event.target.value })} placeholder="Quantity, due date, print/embroidery preference, or anything else we should know." className="mt-1.5 w-full resize-y rounded-lg border border-slate-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" /></label>
              {requestState.error ? (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  <p>{requestState.error}</p>
                  {requestState.offerMailto ? (
                    <p className="mt-2">
                      Download the mockup with the Export button, then
                      {' '}
                      <a className="font-semibold underline" href={mailtoQuote('Mockup request from the Design Studio')}>email it to {site.email}</a>.
                    </p>
                  ) : null}
                </div>
              ) : null}
              <button type="submit" disabled={requestState.status === 'sending'} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 font-semibold text-white hover:bg-primary/90 disabled:opacity-60"><Mail className="h-4 w-4" />{requestState.status === 'sending' ? 'Sending request…' : 'Send mockup request'}</button>
            </form>
          </>}
        </div>
      </div> : null}
      <ChatBot />
    </div>
  );
}
