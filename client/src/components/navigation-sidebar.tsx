import { ScrollArea } from "@/components/ui/scroll-area";
import { bookContent as paperContent } from "@shared/book-content";

// Create a table of contents based on the Human Freedom philosophy course content
const createTableOfContents = () => {
  const tableOfContents: Array<{ id: string; title: string; level: number }> = [
    // Core Philosophical Concepts
    { id: "lecture-1", title: "Lecture 1: Determinism", level: 0 },
    { id: "lecture-2", title: "Lecture 2: Predictability", level: 0 },
    { id: "lecture-3", title: "Lecture 3: Compatibilism", level: 0 },
    { id: "lecture-4", title: "Lecture 4: Incompatibilism", level: 0 },
    
    // Moral Responsibility
    { id: "lecture-5", title: "Lecture 5: Determinism and Moral Responsibility", level: 0 },
    { id: "lecture-6", title: "Lecture 6: Predictability and Moral Responsibility", level: 0 },
    { id: "lecture-7", title: "Lecture 7: Free Will and Causal Necessity", level: 0 },
    
    // Free Will Analysis
    { id: "lecture-8", title: "Lecture 8: The Coherence of Free Will", level: 0 },
    { id: "lecture-9", title: "Lecture 9: Alternative Conceptions of Free Will", level: 0 },
    
    // Experimental Philosophy
    { id: "lecture-10", title: "Lecture 10: The Libet Experiment - Description and Data", level: 0 },
    { id: "lecture-11", title: "Lecture 11: The Libet Experiment - Analysis", level: 0 },
    { id: "lecture-12", title: "Lecture 12: Neuroscience and Free Will", level: 0 },
    
    // Frankfurt Cases
    { id: "lecture-13", title: "Lecture 13: Frankfurt's Analysis of Freedom", level: 0 },
    { id: "lecture-14", title: "Lecture 14: Problems with Frankfurt's Analysis", level: 0 },
    
    // Nature of Freedom
    { id: "lecture-15", title: "Lecture 15: The Actual Nature of Human Freedom", level: 0 },
    { id: "lecture-16", title: "Lecture 16: The Nature of Human Values", level: 0 },
    
    // Mental Health and Freedom
    { id: "lecture-17", title: "Lecture 17: Ego-dystonic vs Ego-syntonic Mental Illness", level: 0 },
    { id: "lecture-18", title: "Lecture 18: Rationalization and Freedom", level: 0 },
    
    // Philosophical Movements
    { id: "lecture-19", title: "Lecture 19: Existentialism - Strengths and Weaknesses", level: 0 },
    { id: "lecture-20", title: "Lecture 20: From Freedom to Agency", level: 0 },
    
    // Reference Materials
    { id: "glossary", title: "Comprehensive Glossary", level: 0 }
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
    
    // If not found, try to find the content by searching text
    if (!element) {
      const titleMap: { [key: string]: string } = {
        "lecture-1": "Determinism is the doctrine that nothing is uncaused - that all events follow necessarily",
        "lecture-2": "Predictability is closely related to, but distinct from, determinism. A system can be deterministic",
        "lecture-3": "Compatibilism holds that free will and determinism can coexist - that our actions can be both determined and free",
        "lecture-4": "Incompatibilism holds that free will and determinism cannot coexist",
        "lecture-5": "The relationship between determinism and moral responsibility is one of the most contested issues",
        "lecture-6": "The relationship between predictability and moral responsibility raises additional complexities",
        "lecture-7": "God's Foreknowledge and Moral Responsibility",
        "lecture-8": "The coherence of free will has been challenged from multiple directions",
        "lecture-9": "The Structure of the Self",
        "lecture-10": "The Libet Experiment: Description and Data",
        "lecture-11": "The Libet Experiment - Why It Does Not Validate Compatibilism",
        "lecture-12": "Frankfurt's Refutation of the \"Could Have Done Otherwise\" Analysis",
        "lecture-13": "Frankfurt's Analysis of Freedom",
        "lecture-14": "Problems with Frankfurt's Analysis of Freedom",
        "lecture-15": "The Actual Nature of Human Freedom",
        "lecture-16": "The Nature of Human Values",
        "lecture-17": "Ego-dystonic vs Ego-syntonic Mental Illness and Freedom",
        "lecture-18": "Rationalization and How It Undermines Freedom",
        "lecture-19": "Existentialism - Its Strengths and Weaknesses",
        "lecture-20": "From Freedom to Agency - A New Framework",
        "glossary": "KEY TERMS DICTIONARY"
      };
      
      const searchText = titleMap[id];
      console.log(`Searching for text: ${searchText}`);
      
      if (searchText) {
        // Find all elements containing this text in the document content area
        const contentArea = document.querySelector('[data-document-content]');
        if (contentArea) {
          const allElements = contentArea.querySelectorAll('h1, h2, h3, h4, h5, h6, p');
          for (let i = 0; i < allElements.length; i++) {
            const el = allElements[i];
            const textContent = el.textContent || '';
            
            // Skip table of contents sections - look for actual lecture content
            // We want to skip the TOC entries and find the actual lecture headings/content
            if (textContent.includes(searchText) && 
                !textContent.includes('Table of Contents') && 
                !el.closest('.table-of-contents') &&
                // Skip short entries that are likely table of contents
                textContent.length > 100) {
              element = el as HTMLElement;
              console.log(`Found element by text search: ${el.tagName} - ${textContent.substring(0, 50)}...`);
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
