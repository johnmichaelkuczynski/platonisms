import { ScrollArea } from "@/components/ui/scroll-area";
import { bookContent as paperContent } from "@shared/book-content";

// Create a table of contents based on the philosophical content with major sections
const createTableOfContents = () => {
  const tableOfContents: Array<{ id: string; title: string; level: number }> = [
    // Major sections from the philosophical content
    { id: "section-1-0", title: "1.0 Why we must grant that there are non-spatiotemporal entities", level: 0 },
    { id: "section-1-1", title: "1.1 Non-spatiotemporal entities (continued)", level: 1 },
    { id: "section-1-2", title: "1.2 Logic property-based, not set-based", level: 1 },
    { id: "section-1-3", title: "1.3 Logic property-based, not set-based (continued)", level: 1 },
    { id: "section-1-4", title: "1.4 The axiom of extensionality", level: 1 },
    
    { id: "section-2-0", title: "2.0 Arguments against Platonism", level: 0 },
    { id: "section-2-1", title: "2.1 Argument #1 against Platonism", level: 1 },
    { id: "section-2-2", title: "2.2 Argument #2", level: 1 },
    { id: "section-2-3", title: "2.3 Argument #3: The third-man argument", level: 1 },
    { id: "section-2-4", title: "2.4 Argument #4: causal impotence of properties", level: 1 },
    { id: "section-2-5", title: "2.5 Argument #5: causal theory of knowledge", level: 1 },
    { id: "section-2-6", title: "2.6 Argument #6: Conceptualism", level: 1 },
    { id: "section-2-7", title: "2.7 Argument #7: Resemblance nominalism", level: 1 },
    { id: "section-2-8", title: "2.8 Argument #8: Conventionalism", level: 1 },
    
    { id: "section-3-0", title: "3.0 Nominalism", level: 0 },
    { id: "section-4-0", title: "4.0 Properties demystified", level: 0 },
    { id: "section-5-0", title: "5.0 Relations and higher-order properties", level: 0 },
    { id: "section-6-0", title: "6.0 Sets and propositions identical with properties", level: 0 }
  ];
  
  return tableOfContents;
};

const tableOfContents = createTableOfContents();



export default function NavigationSidebar() {
  const handleNavClick = (id: string) => {
    console.log(`Clicking navigation item: ${id}`);
    
    // First try to find exact ID match
    let element = document.getElementById(id);
    console.log(`Found element by ID: ${!!element}`);
    
    // If not found by exact ID, try to find the section by searching for its content
    if (!element) {
      // Find the corresponding section in the book content
      const section = paperContent.sections.find(s => s.id === id);
      if (section) {
        console.log(`Searching for section: ${section.title}`);
        
        // Find all elements in the document content area
        const contentArea = document.querySelector('[data-document-content]');
        if (contentArea) {
          const allElements = contentArea.querySelectorAll('h1, h2, h3, h4, h5, h6, p');
          for (let i = 0; i < allElements.length; i++) {
            const el = allElements[i];
            const textContent = el.textContent || '';
            
            // Look for elements that contain the section title or beginning of content
            if ((textContent.includes(section.title) || 
                 textContent.includes(section.content.substring(0, 50))) && 
                textContent.length > 20) {
              element = el as HTMLElement;
              console.log(`Found element by content search: ${el.tagName} - ${textContent.substring(0, 50)}...`);
              break;
            }
          }
        }
      }
    }
    
    if (element) {
      console.log(`Scrolling to element: ${element.tagName}#${element.id || 'no-id'}`);
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      
      // Add a temporary highlight to show the user where they landed
      element.style.backgroundColor = '#fef3c7';
      setTimeout(() => {
        element.style.backgroundColor = '';
      }, 2000);
    } else {
      console.log(`No element found for navigation ID: ${id}`);
    }
  };

  return (
    <aside className="w-48 bg-card shadow-sm border-r border-border sticky top-16 h-[calc(100vh-160px)]">
      <div className="p-3 h-full flex flex-col">
        <h3 className="font-inter font-semibold text-sm text-foreground mb-3 flex-shrink-0">
          Table of Contents
        </h3>
        <ScrollArea className="flex-1 h-full">
          <div className="pr-2">
            <nav className="space-y-1">
              {tableOfContents.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => handleNavClick(entry.id)}
                  className={`block w-full text-left px-2 py-1.5 text-xs hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300 rounded transition-colors font-normal ${
                    entry.level === 0 ? 'text-slate-800 dark:text-slate-200' : 
                    entry.level === 1 ? 'pl-4 text-slate-700 dark:text-slate-300' : 
                    'pl-6 text-slate-700 dark:text-slate-300'
                  }`}
                  title={entry.title}
                >
                  <span className="block text-xs leading-tight whitespace-normal">
                    {entry.title}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </ScrollArea>
      </div>
    </aside>
  );
}
