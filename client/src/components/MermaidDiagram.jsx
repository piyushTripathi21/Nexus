import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    primaryColor: '#6366f1',
    primaryTextColor: '#f1f5f9',
    primaryBorderColor: '#4f46e5',
    lineColor: '#64748b',
    secondaryColor: '#1e293b',
    tertiaryColor: '#0f172a',
    fontFamily: 'Inter, sans-serif',
    fontSize: '14px'
  }
});

export default function MermaidDiagram({ code, title }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!code || !containerRef.current) return;

    const renderDiagram = async () => {
      try {
        containerRef.current.innerHTML = '';
        const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, code);
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (error) {
        console.error('Mermaid render error:', error);
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div class="p-4 text-center text-dark-400">
              <p>Unable to render diagram</p>
              <pre class="mt-2 text-xs text-left bg-dark-800 p-3 rounded-lg overflow-x-auto">${code}</pre>
            </div>
          `;
        }
      }
    };

    renderDiagram();
  }, [code]);

  return (
    <div className="glass-card !p-4">
      {title && <h4 className="text-sm font-semibold text-dark-200 mb-3">{title}</h4>}
      <div 
        ref={containerRef} 
        className="flex justify-center overflow-x-auto [&>svg]:max-w-full"
      />
    </div>
  );
}
