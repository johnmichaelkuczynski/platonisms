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
        "lecture-1": "Lecture1: Determinism",
        "lecture-2": "Lecture 2: Predictability",
        "lecture-3": "Lecture 3: Compatibilism",
        "lecture-4": "Lecture 4: Incompatibilism",
        "lecture-5": "Lecture 5: Determinism and Moral Responsibility",
        "lecture-6": "Lecture 6: Predictability and Moral Responsibility",
        "lecture-7": "Lecture 7: Free Will and Causal Necessity",
        "lecture-8": "Lecture 8: The Coherence of Free Will",
        "lecture-9": "Lecture 9: Alternative Conceptions of Free Will",
        "lecture-10": "Lecture 10: The Libet Experiment: Description and Data",
        "lecture-11": "Lecture 11: The Libet Experiment - Why It Does Not Validate Compatibilism",
        "lecture-12": "Lecture 12: Neuroscience and Free Will",
        "lecture-13": "Lecture 13: Frankfurt's Analysis of Freedom",
        "lecture-14": "Lecture 14: Problems with Frankfurt's Analysis of Freedom",
        "lecture-15": "Lecture 15: The Actual Nature of Human Freedom",
        "lecture-16": "Lecture 16: The Nature of Human Values",
        "lecture-17": "Lecture 17: Ego-dystonic vs Ego-syntonic Mental Illness and Freedom",
        "lecture-18": "Lecture 18: Rationalization and How It Undermines Freedom",
        "lecture-19": "Lecture 19: Existentialism - Its Strengths and Weaknesses",
        "lecture-20": "Lecture 20: From Freedom to Agency - A New Framework",
        "glossary": "COMPREHENSIVE GLOSSARY"
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
            
            // Skip table of contents sections - look for actual theorem statements
            if (textContent.includes(searchText) && 
                !textContent.includes('Table of Contents') && 
                !el.closest('.table-of-contents')) {
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
