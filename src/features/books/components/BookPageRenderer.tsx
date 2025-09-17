import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { numeroALetras } from "@/lib/textUtils";
import { type Book } from "@/types";
import { CoverPagePreview } from "./CoverPagePreview";

interface BookPageRendererProps {
  book: Book;
  currentPageIndex: number;
}

interface PageContent {
  type: 'cover' | 'index' | 'acts' | 'signatures';
  actContent?: string;
}

export const BookPageRenderer = ({ book, currentPageIndex }: BookPageRendererProps) => {
  const [pages, setPages] = useState<PageContent[]>([]);
  const measureRef = useRef<HTMLDivElement>(null);

  // ✅ Función mejorada para dividir contenido basada en altura A4 real
  const splitContentIntoPages = (htmlContent: string) => {
    if (!htmlContent || htmlContent.trim() === '') return [''];

    // ✅ Altura real de página A4 en píxeles
    // A4 = 297mm de altura
    // 1mm = 3.7795px (96 DPI)
    // 297mm = 1122px
    // Menos padding (12 * 0.25rem * 16px = 48px arriba + 48px abajo = 96px)
    const A4_HEIGHT_PX = 297 * 3.7795; // ~1122px
    const PADDING_VERTICAL = 96; // 48px arriba + 48px abajo
    const maxPageHeight = A4_HEIGHT_PX - PADDING_VERTICAL; // ~1026px

    console.log(`📏 Altura A4 calculada: ${A4_HEIGHT_PX}px, Altura disponible: ${maxPageHeight}px`);
    
    // Crear elementos temporales para medición precisa con estilos exactos
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.visibility = 'hidden';
    tempContainer.style.top = '-9999px';
    tempContainer.style.left = '-9999px';
    tempContainer.style.width = '500px'; // Ancho real de página menos padding
    tempContainer.style.fontSize = '0.875rem'; // text-sm
    tempContainer.style.lineHeight = '1.6';
    tempContainer.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    tempContainer.style.textAlign = 'justify';
    tempContainer.className = 'prose-acta';
    
    document.body.appendChild(tempContainer);

    try {
      // Parsear el HTML y dividir por elementos
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      const elements = Array.from(tempDiv.children);

      const fragments: string[] = [];
      let currentFragment = '';
      let currentHeight = 0;

      console.log(`📋 Procesando ${elements.length} elementos`);

      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        
        // Medir la altura del elemento actual
        tempContainer.innerHTML = element.outerHTML;
        const elementHeight = tempContainer.getBoundingClientRect().height;
        
        console.log(`📐 Elemento ${i}: ${elementHeight}px, Total actual: ${currentHeight}px`);

        // Si agregar este elemento excede la altura máxima Y ya hay contenido
        if (currentHeight + elementHeight > maxPageHeight && currentFragment) {
          console.log(`🔄 Fragmento completo: ${currentHeight}px, creando nueva página`);
          
          // Guardar el fragmento actual
          fragments.push(currentFragment);
          
          // Empezar un nuevo fragmento con este elemento
          currentFragment = element.outerHTML;
          currentHeight = elementHeight;
        } else {
          // Agregar el elemento al fragmento actual
          currentFragment += element.outerHTML;
          currentHeight += elementHeight;
        }
      }

      // Agregar el último fragmento si hay contenido
      if (currentFragment) {
        console.log(`📄 Último fragmento: ${currentHeight}px`);
        fragments.push(currentFragment);
      }

      console.log(`✅ Total de fragmentos creados: ${fragments.length}`);
      return fragments.length > 0 ? fragments : [htmlContent];
      
    } finally {
      // Limpiar siempre
      document.body.removeChild(tempContainer);
    }
  };

  // ✅ Calcular páginas dinámicamente
  useEffect(() => {
    const calculatePages = () => {
      console.log('📚 Calculando páginas para libro:', book.name);
      const newPages: PageContent[] = [];
      
      // Página 1: Portada
      newPages.push({ type: 'cover' });
      
      // Página 2: Índice
      newPages.push({ type: 'index' });
      
      // Páginas de actas: con salto automático real
      if (book.actas && book.actas.length > 0) {
        console.log(`📋 Procesando ${book.actas.length} actas`);
        
        // Combinar todo el contenido de todas las actas
        let allContent = '';
        
        book.actas.forEach((acta, index) => {
          console.log(`📝 Procesando acta ${index + 1}: ${acta.name}`);
          
          // Generar contenido completo del acta
          const encabezado = `
            <div class="content-section">
              <p class="text-justify leading-relaxed mb-4">
                <span class="font-medium text-lg">${acta.name}</span>. Sesión ${acta.sessionType || 'ordinaria'} celebrada por el Concejo Municipal en el salón de reuniones de la Alcaldía Municipal de Antiguo Cuscatlán, a las ${acta.sessionTime || 'diez horas'} del día, presidió la reunión la señora Alcaldesa Municipal Licda. Zoila Milagro Navas Quintanilla, con la asistencia del señor Síndico Municipal y de los concejales propietarios. Seguidamente la sesión dio inicio con los siguientes puntos:
              </p>
            </div>
          `;

          // Contenido del cuerpo
          const cuerpo = acta.bodyContent || `
            <div class="content-section text-center text-gray-500 italic">
              <p>El contenido del acta será definido en el editor.</p>
            </div>
          `;

          // Acuerdos si existen
          const acuerdos = acta.agreements && acta.agreements.length > 0 ? `
            <div class="content-section">
              <h4 class="font-bold text-center mb-3 underline">ACUERDOS</h4>
              <div class="space-y-2">
                ${acta.agreements.map((agreement, agreementIndex) => `
                  <div class="text-justify">
                    <p class="mb-2">
                      <span class="font-bold">ACUERDO ${agreementIndex + 1}°:</span> ${agreement}
                    </p>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : '';

          // Combinar todo el contenido del acta
          allContent += `<div class="act-content">${encabezado}${cuerpo}${acuerdos}</div>`;
          
          // Agregar separador entre actas (excepto la última)
          if (book.actas && index < book.actas.length - 1) {
            allContent += `
              <div class="content-section" style="text-align: center; margin: 3rem 0;">
                <hr style="width: 50%; border-top: 2px solid #666; margin: 0 auto;">
              </div>
            `;
          }
        });

        console.log(`📏 Contenido total generado: ${allContent.length} caracteres`);

        // Dividir todo el contenido en fragmentos que quepan en páginas
        const contentFragments = splitContentIntoPages(allContent);
        
        console.log(`📄 Fragmentos creados: ${contentFragments.length}`);
        
        // Crear páginas para cada fragmento
        contentFragments.forEach((fragment, index) => {
          console.log(`📄 Página de acta ${index + 3}: ${fragment.length} caracteres`);
          newPages.push({
            type: 'acts',
            actContent: fragment
          });
        });
      }
      
      // Última página: Firmas (si hay actas)
      if (book.actas && book.actas.length > 0) {
        newPages.push({ type: 'signatures' });
      }
      
      console.log(`✅ Total de páginas generadas: ${newPages.length}`);
      setPages(newPages);
    };

    // Pequeño delay para asegurar que el DOM esté listo
    const timer = setTimeout(calculatePages, 200);
    return () => clearTimeout(timer);
  }, [book]);

  // ✅ Función para formatear fecha de cierre
  const formatClosingDate = () => {
    const now = new Date();
    const dayInWords = numeroALetras(now.getDate());
    const monthName = format(now, "MMMM", { locale: es });
    const yearInWords = numeroALetras(now.getFullYear());
    
    return {
      dayInWords,
      monthName,
      yearInWords
    };
  };

  const renderPage = (page: PageContent) => {
    switch (page.type) {
      case 'cover':
        return (
          <CoverPagePreview 
            bookName={book.name}
            creationDate={new Date(book.createdAt)}
            tome={book.tome}
          />
        );

      case 'index':
        return (
          <div className="a4-page">
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold uppercase">ÍNDICE</h2>
            </div>
            
            {!book.actas || book.actas.length === 0 ? (
              <p className="text-center text-gray-500 italic">
                No hay actas creadas aún
              </p>
            ) : (
              <div className="space-y-3">
                {book.actas.map((acta, index) => (
                  <div key={acta.id} className="flex justify-between border-b border-dotted border-gray-300 pb-1">
                    <span className="text-sm">{acta.name}</span>
                    <span className="text-sm">{index + 3}</span>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex-1" />
          </div>
        );

      case 'acts':
        return (
          <div className="a4-page">
            <div className="acts-content-area">
              <div
                className="prose-acta text-justify leading-relaxed"
                dangerouslySetInnerHTML={{ __html: page.actContent || '' }}
              />
            </div>
          </div>
        );

      case 'signatures':
        const { dayInWords, monthName, yearInWords } = formatClosingDate();
        const totalActas = book.actas?.length || 0;
        const totalActasEnLetras = numeroALetras(totalActas);
        
        return (
          <div className="a4-page">
            <div className="content-section">
              <p className="text-justify leading-relaxed mb-6 font-bold">
                El Consejo Municipal
              </p>

              <p className="text-justify leading-relaxed mb-4">
                Cierra el presente Libro de Actas Municipales que llevó durante el corriente año, con{" "}
                <span className="font-bold">{totalActasEnLetras}</span> Actas asentadas.
              </p>
              
              <p className="text-justify leading-relaxed mb-8">
                Alcaldía Municipal de Antiguo Cuscatlán, a los{" "}
                <span className="font-bold">
                  {dayInWords} días del mes de {monthName} de {yearInWords}
                </span>.
              </p>

              <div className="signatures-section mt-12 space-y-8">
                <div className="text-center">
                  <div className="border-b border-black w-64 mx-auto mb-2"></div>
                  <p className="font-bold">Licda. Zoila Milagro Navas Quintanilla</p>
                  <p>Alcaldesa Municipal</p>
                </div>

                <div className="grid grid-cols-2 gap-8 mt-8">
                  <div className="text-center">
                    <div className="border-b border-black w-48 mx-auto mb-2"></div>
                    <p className="font-bold">
                      {book.actas?.[0]?.attendees?.sindico?.name || "[Síndico]"}
                    </p>
                    <p>Síndico Municipal</p>
                  </div>

                  <div className="text-center">
                    <div className="border-b border-black w-48 mx-auto mb-2"></div>
                    <p className="font-bold">
                      {book.actas?.[0]?.attendees?.secretaria?.name || "[Secretaria]"}
                    </p>
                    <p>Secretaria Municipal</p>
                  </div>
                </div>

                {/* Concejales */}
                {book.actas?.[0]?.attendees?.propietarios && 
                 book.actas[0].attendees.propietarios.length > 0 && (
                  <div className="mt-8">
                    <h4 className="font-bold text-center mb-4">CONCEJALES PROPIETARIOS</h4>
                    <div className="grid grid-cols-2 gap-6">
                      {book.actas[0].attendees.propietarios.map((concejal, index) => (
                        <div key={index} className="text-center">
                          <div className="border-b border-black w-48 mx-auto mb-2"></div>
                          <p className="font-bold">{concejal.name}</p>
                          <p>Concejal Propietario</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex-1" />
          </div>
        );

      default:
        return (
          <div className="a4-page">
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500">Página no encontrada</p>
            </div>
          </div>
        );
    }
  };

  if (!pages[currentPageIndex]) {
    return (
      <div className="a4-page">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Página no encontrada</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Elemento oculto para medición */}
      <div ref={measureRef} className="hidden" />
      {renderPage(pages[currentPageIndex])}
    </div>
  );
};