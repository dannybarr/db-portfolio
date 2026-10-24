import { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, Download, ExternalLink, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

export default function ProjectPdfViewer({ url }: { url: string }) {
  const viewport = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(700);
  const [pages, setPages] = useState(0);
  const [current, setCurrent] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [failed, setFailed] = useState(false);
  const [downloadFile, setDownloadFile] = useState<Blob | null>(null);
  const [downloadError, setDownloadError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setDownloadFile(null);
    setDownloadError(false);
    fetch(url, { signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error('PDF download unavailable');
        const blob = await response.blob();
        if (!blob.size || !blob.type.includes('pdf')) throw new Error('Invalid PDF');
        setDownloadFile(blob);
      })
      .catch(() => { if (!controller.signal.aborted) setDownloadError(true); });
    return () => controller.abort();
  }, [url]);

  const download = async () => {
    if (!downloadFile) return;
    const filename = 'dannys-guide-to-aeo-dblabs.pdf';
    const file = new File([downloadFile], filename, { type: 'application/pdf' });
    if (matchMedia('(pointer: coarse)').matches && navigator.canShare?.({ files: [file] })) {
      try { await navigator.share({ files: [file], title: filename }); return; }
      catch (error) { if (error instanceof DOMException && error.name === 'AbortError') return; }
    }
    const objectUrl = URL.createObjectURL(downloadFile);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 30_000);
  };

  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const observer = new ResizeObserver(() => setWidth(Math.max(200, element.clientWidth - 24)));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const navigate = (page: number) => {
    const target = viewport.current?.querySelector<HTMLElement>(`[data-pdf-page="${page}"]`);
    if (!target) return;
    viewport.current?.scrollTo({ top: target.offsetTop - 12, behavior: 'instant' });
    setCurrent(page);
  };

  return (
    <section className="mt-3 overflow-hidden rounded-md border border-window-divider bg-window-surface" aria-label="AEO PDF reader">
      <div className="flex min-h-10 flex-wrap items-center justify-between gap-1 border-b border-window-divider bg-window-chrome px-2 py-1">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Previous page" aria-label="Previous page" disabled={current <= 1} onClick={() => navigate(current - 1)}><ChevronLeft /></Button>
          <span className="min-w-12 text-center font-mono text-xs" aria-live="polite">{current} / {pages || '…'}</span>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Next page" aria-label="Next page" disabled={!pages || current >= pages} onClick={() => navigate(current + 1)}><ChevronRight /></Button>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Zoom out" aria-label="Zoom out" disabled={zoom <= 1} onClick={() => setZoom(value => Math.max(1, value - 0.25))}><Minus /></Button>
          <span className="w-10 text-center font-mono text-xs">{Math.round(zoom * 100)}%</span>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Zoom in" aria-label="Zoom in" disabled={zoom >= 2} onClick={() => setZoom(value => Math.min(2, value + 0.25))}><Plus /></Button>
          <Button asChild variant="ghost" size="icon" className="h-8 w-8"><a href={url} target="_blank" rel="noopener noreferrer" title="Open PDF" aria-label="Open PDF"><ExternalLink /></a></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!downloadFile} onClick={download} title="Download PDF" aria-label="Download PDF"><Download /></Button>
        </div>
      </div>
      <div ref={viewport} tabIndex={0} aria-label="PDF pages" className="relative h-[min(440px,calc(92dvh-190px))] min-h-40 overflow-auto overscroll-contain bg-window-chrome p-3" onScroll={() => {
        const element = viewport.current;
        if (!element) return;
        const elements = Array.from(element.querySelectorAll<HTMLElement>('[data-pdf-page]'));
        const active = elements.find(page => page.offsetTop + page.offsetHeight > element.scrollTop + 24);
        if (active) setCurrent(Number(active.dataset['pdfPage']));
      }}>
        <Document file={url} onLoadSuccess={({ numPages }) => setPages(numPages)} onLoadError={() => setFailed(true)} externalLinkTarget="_blank" externalLinkRel="noopener noreferrer" loading={<p className="p-4 text-sm">Loading PDF…</p>} error={<p className="p-4 text-sm">The PDF could not load. <a href={url} target="_blank" rel="noopener noreferrer" className="underline">Open the document</a></p>}>
          {Array.from({ length: pages }, (_, index) => (
            <div key={index} data-pdf-page={index + 1} className="mb-3 w-fit last:mb-0">
              <Page pageNumber={index + 1} width={Math.floor(width * zoom)} renderTextLayer renderAnnotationLayer />
            </div>
          ))}
        </Document>
        {failed && <span className="sr-only" role="alert">PDF unavailable</span>}
      </div>
      <footer className="border-t border-window-divider p-2">
        <Button className="project-window-link w-full" disabled={!downloadFile} onClick={download}><Download />Download PDF</Button>
        {downloadError && <p role="alert" className="mt-2 text-xs">Download unavailable. <a href={url} target="_blank" rel="noopener noreferrer" className="underline">Open PDF</a></p>}
      </footer>
    </section>
  );
}