import React from 'react';

const applyInlineFormatting = (text: string, keyPrefix: string): (string | JSX.Element)[] => {
    // This regex will split the string by **bold** or _italic_ parts, keeping the delimiters.
    const parts = text.split(/(\*\*.*?\*\*|_.*?_)/g).filter(part => part); // filter out empty strings
    
    return parts.map((part, index) => {
        const key = `${keyPrefix}-${index}`;
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={key} className="font-semibold">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('_') && part.endsWith('_')) {
            return <em key={key} className="italic">{part.slice(1, -1)}</em>;
        }
        return part; // Return as plain text if no formatting matches
    });
};

export const RichTextRenderer: React.FC<{ content: string }> = ({ content }) => {
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];
        const key = `line-${i}`;

        if (line.startsWith('#### ')) {
            const text = line.substring(5);
            elements.push(<h4 key={key} className="text-base font-semibold mt-2 mb-1">{applyInlineFormatting(text, key)}</h4>);
            i++;
            continue;
        }
        if (line.startsWith('### ')) {
            const text = line.substring(4);
            elements.push(<h3 key={key} className="text-lg font-semibold mt-3 mb-1">{applyInlineFormatting(text, key)}</h3>);
            i++;
            continue;
        }
        if (line.startsWith('## ')) {
            const text = line.substring(3);
            elements.push(<h2 key={key} className="text-xl font-bold mt-4 mb-2">{applyInlineFormatting(text, key)}</h2>);
            i++;
            continue;
        }
        if (line.startsWith('# ')) {
            const text = line.substring(2);
            elements.push(<h1 key={key} className="text-2xl font-bold mt-4 mb-2">{applyInlineFormatting(text, key)}</h1>);
            i++;
            continue;
        }
        
        // Manejar listas no ordenadas
        if (line.startsWith('- ') || line.startsWith('* ')) {
            const listItems: string[] = [];
            const listKey = `ul-${i}`;
            while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
                listItems.push(lines[i].substring(2));
                i++;
            }
            elements.push(
                <ul key={listKey} className="list-none pl-2 space-y-1 my-2">
                    {listItems.map((item, itemIndex) => (
                        <li key={`${listKey}-li-${itemIndex}`} className="flex items-start">
                            <span className="mr-2 text-muted-foreground mt-1.5">●</span>
                            <span>{applyInlineFormatting(item, `${listKey}-li-${itemIndex}`)}</span>
                        </li>
                    ))}
                </ul>
            );
            continue;
        }

        // Manejar listas ordenadas
        if (/^\d+\.\s/.test(line)) {
            const listItems: string[] = [];
            const listKey = `ol-${i}`;
            while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
                listItems.push(lines[i].replace(/^\d+\.\s/, ''));
                i++;
            }
            elements.push(
                <ol key={listKey} className="list-decimal list-inside space-y-1 my-2">
                    {listItems.map((item, itemIndex) => (
                        <li key={`${listKey}-li-${itemIndex}`} className="pl-2">
                             {applyInlineFormatting(item, `${listKey}-li-${itemIndex}`)}
                        </li>
                    ))}
                </ol>
            );
            continue;
        }

        if (line.trim() === '') {
            elements.push(<div key={key} className="h-4" />);
            i++;
            continue;
        }
        
        elements.push(<p key={key} className="my-0.5">{applyInlineFormatting(line, key)}</p>);
        i++;
    }

    return (
        <div className="leading-relaxed text-left">
            {elements}
        </div>
    );
};
