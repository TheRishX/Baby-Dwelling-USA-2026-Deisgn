import { useState, useRef, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  List, 
  ListOrdered, 
  Code, 
  Eye, 
  Heading1, 
  Heading2, 
  Heading3, 
  Palette, 
  Undo, 
  Redo, 
  HelpCircle
} from 'lucide-react';

interface WysiwygEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

export default function WysiwygEditor({ value, onChange, label, placeholder = 'Write beautiful content...' }: WysiwygEditorProps) {
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Initialize content on load or model change
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const executeCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    handleInput();
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const handleColorChange = (color: string) => {
    executeCommand('foreColor', color);
    setShowColorPicker(false);
  };

  const COLORS = [
    { name: 'Charcoal', hex: '#1C1F1D' },
    { name: 'Terracotta', hex: '#A85E46' },
    { name: 'Muted Sage', hex: '#6E7A63' },
    { name: 'Sand Accent', hex: '#C2B095' },
    { name: 'Soft Gray', hex: '#7C807E' },
    { name: 'Gold Accent', hex: '#D4AF37' },
    { name: 'Pure Red', hex: '#D93838' },
    { name: 'Ocean Blue', hex: '#008060' }
  ];

  return (
    <div className="flex flex-col gap-2 font-sans w-full">
      {label && (
        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center justify-between">
          <span>{label}</span>
          <span className="text-[10px] text-[#008060] bg-[#EAF3EF] px-2 py-0.5 rounded-full font-semibold">
            Shopify Rich Text Engine
          </span>
        </label>
      )}

      <div className="border border-gray-200 dark:border-gray-700/60 rounded-2xl overflow-hidden bg-white dark:bg-charcoal/80 shadow-sm focus-within:ring-2 focus-within:ring-[#008060]/20 transition-all">
        {/* WYSIWYG Toolbar */}
        <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 border-b border-gray-100 select-none">
          {/* Visual Commands */}
          {!isHtmlMode ? (
            <>
              <button
                type="button"
                onClick={() => executeCommand('bold')}
                className="p-1.5 hover:bg-gray-200/70 rounded-md text-gray-700 transition-colors"
                title="Bold (Ctrl+B)"
              >
                <Bold size={15} />
              </button>
              <button
                type="button"
                onClick={() => executeCommand('italic')}
                className="p-1.5 hover:bg-gray-200/70 rounded-md text-gray-700 transition-colors"
                title="Italic (Ctrl+I)"
              >
                <Italic size={15} />
              </button>
              <button
                type="button"
                onClick={() => executeCommand('underline')}
                className="p-1.5 hover:bg-gray-200/70 rounded-md text-gray-700 transition-colors"
                title="Underline (Ctrl+U)"
              >
                <Underline size={15} />
              </button>

              <div className="w-[1px] h-4 bg-gray-200 mx-1" />

              <button
                type="button"
                onClick={() => executeCommand('formatBlock', '<h1>')}
                className="p-1.5 hover:bg-gray-200/70 rounded-md text-gray-700 transition-colors flex items-center gap-0.5 font-bold text-xs"
                title="Heading 1"
              >
                <Heading1 size={15} />
              </button>
              <button
                type="button"
                onClick={() => executeCommand('formatBlock', '<h2>')}
                className="p-1.5 hover:bg-gray-200/70 rounded-md text-gray-700 transition-colors flex items-center gap-0.5 font-bold text-xs"
                title="Heading 2"
              >
                <Heading2 size={15} />
              </button>
              <button
                type="button"
                onClick={() => executeCommand('formatBlock', '<h3>')}
                className="p-1.5 hover:bg-gray-200/70 rounded-md text-gray-700 transition-colors flex items-center gap-0.5 font-bold text-xs"
                title="Heading 3"
              >
                <Heading3 size={15} />
              </button>
              <button
                type="button"
                onClick={() => executeCommand('formatBlock', '<p>')}
                className="p-1.5 hover:bg-gray-200/70 rounded-md text-gray-700 transition-colors text-xs font-semibold px-1"
                title="Paragraph"
              >
                P
              </button>

              <div className="w-[1px] h-4 bg-gray-200 mx-1" />

              <button
                type="button"
                onClick={() => executeCommand('insertUnorderedList')}
                className="p-1.5 hover:bg-gray-200/70 rounded-md text-gray-700 transition-colors"
                title="Bullet List"
              >
                <List size={15} />
              </button>
              <button
                type="button"
                onClick={() => executeCommand('insertOrderedList')}
                className="p-1.5 hover:bg-gray-200/70 rounded-md text-gray-700 transition-colors"
                title="Numbered List"
              >
                <ListOrdered size={15} />
              </button>

              <div className="w-[1px] h-4 bg-gray-200 mx-1" />

              <button
                type="button"
                onClick={() => executeCommand('justifyLeft')}
                className="p-1.5 hover:bg-gray-200/70 rounded-md text-gray-700 transition-colors"
                title="Align Left"
              >
                <AlignLeft size={15} />
              </button>
              <button
                type="button"
                onClick={() => executeCommand('justifyCenter')}
                className="p-1.5 hover:bg-gray-200/70 rounded-md text-gray-700 transition-colors"
                title="Align Center"
              >
                <AlignCenter size={15} />
              </button>
              <button
                type="button"
                onClick={() => executeCommand('justifyRight')}
                className="p-1.5 hover:bg-gray-200/70 rounded-md text-gray-700 transition-colors"
                title="Align Right"
              >
                <AlignRight size={15} />
              </button>

              <div className="w-[1px] h-4 bg-gray-200 mx-1" />

              {/* Color picker */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="p-1.5 hover:bg-gray-200/70 rounded-md text-gray-700 transition-colors flex items-center gap-1"
                  title="Text Color"
                >
                  <Palette size={15} />
                </button>
                {showColorPicker && (
                  <div className="absolute top-full left-0 mt-1.5 bg-white shadow-xl border border-gray-100 rounded-xl p-2.5 z-50 grid grid-cols-4 gap-1.5 min-w-[120px]">
                    {COLORS.map((col) => (
                      <button
                        key={col.hex}
                        type="button"
                        onClick={() => handleColorChange(col.hex)}
                        className="w-5 h-5 rounded-full border border-gray-200 cursor-pointer active:scale-95 transition-transform"
                        style={{ backgroundColor: col.hex }}
                        title={col.name}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="w-[1px] h-4 bg-gray-200 mx-1" />

              <button
                type="button"
                onClick={() => executeCommand('undo')}
                className="p-1.5 hover:bg-gray-200/70 rounded-md text-gray-700 transition-colors"
                title="Undo"
              >
                <Undo size={15} />
              </button>
              <button
                type="button"
                onClick={() => executeCommand('redo')}
                className="p-1.5 hover:bg-gray-200/70 rounded-md text-gray-700 transition-colors"
                title="Redo"
              >
                <Redo size={15} />
              </button>
            </>
          ) : (
            <span className="text-[10px] text-gray-400 font-mono px-2 py-1">
              Editing raw HTML source code directly
            </span>
          )}

          {/* Toggle Code Mode */}
          <div className="ml-auto flex items-center">
            <button
              type="button"
              onClick={() => setIsHtmlMode(!isHtmlMode)}
              className={`p-1.5 rounded-md transition-colors flex items-center gap-1.5 text-[11px] font-semibold font-mono ${
                isHtmlMode 
                  ? 'bg-charcoal text-white hover:bg-charcoal/90' 
                  : 'text-gray-500 hover:bg-gray-200/70'
              }`}
              title={isHtmlMode ? "Switch to Visual Editor" : "Switch to Raw HTML Mode"}
            >
              {isHtmlMode ? <Eye size={14} /> : <Code size={14} />}
              <span>{isHtmlMode ? 'Visual' : 'HTML'}</span>
            </button>
          </div>
        </div>

        {/* Content Editing Areas */}
        <div className="relative">
          {/* Visual editor */}
          <div
            ref={editorRef}
            contentEditable={!isHtmlMode}
            onInput={handleInput}
            className={`w-full min-h-[160px] max-h-[350px] overflow-y-auto p-4 outline-none font-sans text-sm text-charcoal/95 dark:text-warm-white bg-white dark:bg-charcoal/90 leading-relaxed visual-prose ${
              isHtmlMode ? 'hidden' : 'block'
            }`}
            style={{
              minHeight: '160px',
            }}
            placeholder={placeholder}
          />

          {/* HTML Raw Code editor */}
          {isHtmlMode && (
            <textarea
              value={value}
              onChange={(e) => {
                onChange(e.target.value);
                if (editorRef.current) {
                  editorRef.current.innerHTML = e.target.value;
                }
              }}
              className="w-full min-h-[160px] max-h-[350px] p-4 font-mono text-xs text-charcoal bg-gray-50 border-none outline-none focus:ring-0 dark:bg-charcoal/95 dark:text-warm-white leading-relaxed resize-none block"
              placeholder="&lt;p&gt;Write custom HTML here...&lt;/p&gt;"
            />
          )}
        </div>
      </div>

      {/* Embedded visual styling custom helpers for raw preview */}
      <style>{`
        .visual-prose:empty:before {
          content: attr(placeholder);
          color: #9CA3AF;
          font-style: italic;
        }
        .visual-prose h1 {
          font-size: 1.6em;
          font-weight: bold;
          margin-top: 0.6em;
          margin-bottom: 0.4em;
          font-family: serif;
        }
        .visual-prose h2 {
          font-size: 1.35em;
          font-weight: bold;
          margin-top: 0.5em;
          margin-bottom: 0.3em;
          font-family: serif;
        }
        .visual-prose h3 {
          font-size: 1.15em;
          font-weight: bold;
          margin-top: 0.4em;
          margin-bottom: 0.2em;
          font-family: serif;
        }
        .visual-prose p {
          margin-bottom: 0.75rem;
        }
        .visual-prose ul {
          list-style-type: disc;
          padding-left: 1.25rem;
          margin-bottom: 0.75rem;
        }
        .visual-prose ol {
          list-style-type: decimal;
          padding-left: 1.25rem;
          margin-bottom: 0.75rem;
        }
        .visual-prose blockquote {
          border-left: 3px solid #6E7A63;
          padding-left: 1rem;
          color: #6B7280;
          font-style: italic;
          margin: 0.75rem 0;
        }
      `}</style>
    </div>
  );
}
