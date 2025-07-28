import { ScrollArea } from "@/components/ui/scroll-area";
import { bookContent as paperContent } from "@shared/book-content";

// Create a table of contents based on the symbolic logic content
const createTableOfContents = () => {
  const tableOfContents: Array<{ id: string; title: string; level: number }> = [
    // Symbolic Logic Course Content
    { id: "week-1", title: "Week 1: Basic Concepts, Notation, and Logical Operators", level: 0 },
    { id: "introduction-to-logic", title: "Introduction to Logic", level: 1 },
    { id: "basic-concepts", title: "Basic Concepts", level: 1 },
    { id: "basic-logical-symbols", title: "Basic Logical Symbols", level: 1 },
    { id: "material-vs-strict-implication", title: "Material vs. Strict Implication", level: 1 },
    { id: "translation-practice", title: "Translation Practice", level: 1 },
    
    { id: "homework-1", title: "Homework 1: Basic Concepts and Notation", level: 0 },
    
    { id: "week-2", title: "Week 2: Truth Tables and Elementary Proofs", level: 0 },
    { id: "propositional-calculus", title: "The Propositional Calculus", level: 1 },
    { id: "truth-tables", title: "Truth Tables", level: 1 },
    { id: "elementary-proofs", title: "Elementary Proofs", level: 1 },
    { id: "de-morgans-laws", title: "De Morgan's Laws", level: 1 },
    
    { id: "homework-2", title: "Homework 2: Truth Tables and Elementary Proofs", level: 0 },
    
    { id: "week-3", title: "Week 3: Boolean Algebra", level: 0 },
    { id: "boolean-algebra", title: "Introduction to Boolean Algebra", level: 1 },
    { id: "basic-operations", title: "Basic Operations", level: 1 },
    { id: "fundamental-laws", title: "Fundamental Laws of Boolean Algebra", level: 1 },
    { id: "boolean-functions", title: "Boolean Functions and Truth Tables", level: 1 },
    { id: "digital-logic", title: "Applications in Digital Logic", level: 1 }
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
