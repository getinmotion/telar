import { RichTextContent } from "@/types/storyblok";

interface StoryblokRichTextProps {
  content: RichTextContent;
  className?: string;
}

// Render Storyblok rich text content
export function StoryblokRichText({ content, className = "" }: StoryblokRichTextProps) {
  if (!content) return null;

  return (
    <div className={`prose prose-slate dark:prose-invert max-w-none ${className}`}>
      {renderNode(content)}
    </div>
  );
}

function renderNode(node: RichTextContent): React.ReactNode {
  if (!node) return null;

  // Text node
  if (node.type === 'text') {
    let text: React.ReactNode = node.text || '';
    
    // Apply marks (bold, italic, etc.)
    if (node.marks && node.marks.length > 0) {
      for (const mark of node.marks) {
        switch (mark.type) {
          case 'bold':
            text = <strong>{text}</strong>;
            break;
          case 'italic':
            text = <em>{text}</em>;
            break;
          case 'underline':
            text = <u>{text}</u>;
            break;
          case 'strike':
            text = <s>{text}</s>;
            break;
          case 'code':
            text = <code className="bg-muted px-1 py-0.5 rounded">{text}</code>;
            break;
          case 'link':
            text = (
              <a 
                href={mark.attrs?.href} 
                target={mark.attrs?.target || '_self'}
                className="text-primary hover:underline"
              >
                {text}
              </a>
            );
            break;
        }
      }
    }
    
    return text;
  }

  // Container nodes with children
  const children = node.content?.map((child, index) => (
    <span key={index}>{renderNode(child)}</span>
  ));

  switch (node.type) {
    case 'doc':
      return <>{children}</>;
    
    case 'paragraph':
      return <p className="mb-4">{children}</p>;
    
    case 'heading':
      const level = node.attrs?.level || 2;
      const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
      const headingClasses: Record<number, string> = {
        1: 'text-3xl font-bold mb-6',
        2: 'text-2xl font-semibold mb-4 mt-8',
        3: 'text-xl font-semibold mb-3 mt-6',
        4: 'text-lg font-semibold mb-2 mt-4',
        5: 'text-base font-semibold mb-2 mt-4',
        6: 'text-sm font-semibold mb-2 mt-4',
      };
      return <HeadingTag className={headingClasses[level]}>{children}</HeadingTag>;
    
    case 'bullet_list':
      return <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>;
    
    case 'ordered_list':
      return <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>;
    
    case 'list_item':
      return <li>{children}</li>;
    
    case 'blockquote':
      return (
        <blockquote className="border-l-4 border-primary pl-6 my-6 italic text-muted-foreground">
          {children}
        </blockquote>
      );
    
    case 'code_block':
      return (
        <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4">
          <code>{node.content?.map(c => c.text).join('')}</code>
        </pre>
      );
    
    case 'horizontal_rule':
      return <hr className="my-8 border-border" />;
    
    case 'hard_break':
      return <br />;
    
    case 'image':
      return (
        <figure className="my-6">
          <img 
            src={node.attrs?.src} 
            alt={node.attrs?.alt || ''} 
            className="rounded-lg w-full"
          />
          {node.attrs?.title && (
            <figcaption className="text-center text-sm text-muted-foreground mt-2">
              {node.attrs.title}
            </figcaption>
          )}
        </figure>
      );
    
    default:
      return <>{children}</>;
  }
}
