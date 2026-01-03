/**
 * Search query parser for GitHub-style key:value search syntax
 * Supports multiple filters like: type:traceback sender:alice receiver:bob
 */

export interface ParsedSearchQuery {
    type: string[];
    sender: string[];
    receiver: string[];
    interface: string[];
    plainText: string;
}

/**
 * Parses a search query string into structured filters
 * Example: "type:traceback sender:alice hello" 
 * Returns: { type: ['traceback'], sender: ['alice'], receiver: [], interface: [], plainText: 'hello' }
 */
export function parseSearchQuery(query: string): ParsedSearchQuery {
    const result: ParsedSearchQuery = {
        type: [],
        sender: [],
        receiver: [],
        interface: [],
        plainText: ''
    };

    if (!query || !query.trim()) {
        return result;
    }

    // Regular expression to match key:value pairs
    // Supports quoted values: key:"value with spaces" or key:value
    const qualifierRegex = /(\w+):((?:"[^"]*")|(?:[^\s]+))/g;
    
    let match;
    const matchedIndices: Array<[number, number]> = [];
    
    // Extract all key:value pairs
    while ((match = qualifierRegex.exec(query)) !== null) {
        if (!match[1] || !match[2]) continue;
        
        const key = match[1].toLowerCase();
        let value = match[2];
        
        // Remove quotes if present
        if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1);
        }
        
        // Store matched position to exclude from plainText later
        matchedIndices.push([match.index, match.index + match[0].length]);
        
        // Add value to appropriate filter array
        switch (key) {
            case 'type':
                result.type.push(value);
                break;
            case 'sender':
                result.sender.push(value);
                break;
            case 'receiver':
                result.receiver.push(value);
                break;
            case 'interface':
                result.interface.push(value);
                break;
            // Ignore unknown qualifiers - they'll be part of plainText
        }
    }
    
    // Extract plain text (everything not matched by qualifiers)
    let plainText = '';
    let lastIndex = 0;
    
    for (const [start, end] of matchedIndices) {
        if (start > lastIndex) {
            plainText += query.substring(lastIndex, start);
        }
        lastIndex = end;
    }
    
    if (lastIndex < query.length) {
        plainText += query.substring(lastIndex);
    }
    
    result.plainText = plainText.trim();
    
    return result;
}

/**
 * Checks if a value matches any of the filter values (case-insensitive substring match)
 */
function matchesAny(value: string, filters: string[]): boolean {
    if (filters.length === 0) return true;
    
    const lowerValue = value.toLowerCase();
    return filters.some(filter => lowerValue.includes(filter.toLowerCase()));
}

/**
 * Checks if a row matches the plainText search across all searchable fields
 */
function matchesPlainText(row: { blockType: string; sender: string; receiver: string; interface: string }, plainText: string): boolean {
    if (!plainText) return true;
    
    const lowerPlainText = plainText.toLowerCase();
    const searchableFields = [
        row.blockType,
        row.sender,
        row.receiver,
        row.interface
    ];
    
    return searchableFields.some(field => 
        field && field.toLowerCase().includes(lowerPlainText)
    );
}

/**
 * Filters an array of rows based on parsed search query
 * Uses AND logic between different qualifiers and OR logic between same qualifiers
 */
export function filterRowsBySearch<T extends {
    blockType: string;
    sender: string;
    receiver: string;
    interface: string;
}>(rows: T[], parsedQuery: ParsedSearchQuery): T[] {
    return rows.filter(row => {
        // Check type filter (OR logic between multiple type values)
        if (!matchesAny(row.blockType, parsedQuery.type)) return false;
        
        // Check sender filter (OR logic between multiple sender values)
        if (!matchesAny(row.sender, parsedQuery.sender)) return false;
        
        // Check receiver filter (OR logic between multiple receiver values)
        if (!matchesAny(row.receiver, parsedQuery.receiver)) return false;
        
        // Check interface filter (OR logic between multiple interface values)
        if (!matchesAny(row.interface, parsedQuery.interface)) return false;
        
        // Check plain text search
        if (!matchesPlainText(row, parsedQuery.plainText)) return false;
        
        return true;
    });
}

/**
 * Escapes HTML special characters to prevent XSS
 */
function escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Highlights search terms in text with HTML mark tags
 * Returns HTML string with highlighted matches
 */
export function highlightMatches(text: string, searchTerms: string[]): string {
    if (!text || searchTerms.length === 0) {
        return escapeHtml(text);
    }
    
    // Escape the original text first
    let result = escapeHtml(text);
    
    // Create a regex pattern for all search terms (case-insensitive)
    // Sort by length descending to match longer terms first
    const sortedTerms = [...searchTerms]
        .filter(term => term.trim().length > 0)
        .sort((a, b) => b.length - a.length);
    
    if (sortedTerms.length === 0) return result;
    
    // Build regex pattern
    const pattern = sortedTerms
        .map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) // Escape special regex chars
        .join('|');
    
    const regex = new RegExp(`(${pattern})`, 'gi');
    
    // Replace matches with highlighted version in blue
    result = result.replace(regex, '<mark class="bg-blue-900/20 dark:bg-blue-400/30 text-blue-900 dark:text-blue-100 px-0.5 rounded font-medium">$1</mark>');
    
    return result;
}

/**
 * Get all relevant search terms for a specific field
 */
export function getSearchTermsForField(
    parsedQuery: ParsedSearchQuery, 
    field: 'type' | 'sender' | 'receiver' | 'interface'
): string[] {
    const terms = [...parsedQuery[field]];
    
    // Also include plain text if present
    if (parsedQuery.plainText) {
        terms.push(parsedQuery.plainText);
    }
    
    return terms;
}

/**
 * Token types for syntax highlighting in search input
 */
export type TokenType = 'qualifier' | 'colon' | 'value' | 'text' | 'whitespace';

export interface SearchToken {
    type: TokenType;
    text: string;
}

/**
 * Tokenizes search query for syntax highlighting
 * Returns array of tokens with their types
 */
export function tokenizeSearchQuery(query: string): SearchToken[] {
    if (!query) return [];
    
    const tokens: SearchToken[] = [];
    const qualifierRegex = /(\w+)(:)((?:"[^"]*")|(?:[^\s]+))|(\s+)|([^\s:]+)/g;
    
    let match;
    let lastIndex = 0;
    
    while ((match = qualifierRegex.exec(query)) !== null) {
        // Check if we skipped any characters (shouldn't happen with our regex)
        if (match.index > lastIndex) {
            tokens.push({
                type: 'text',
                text: query.substring(lastIndex, match.index)
            });
        }
        
        if (match[1] && match[2] && match[3]) {
            // Qualifier:value pattern
            const qualifier = match[1];
            const validQualifiers = ['type', 'sender', 'receiver', 'interface'];
            
            if (validQualifiers.includes(qualifier.toLowerCase())) {
                // Known qualifier - highlight it
                tokens.push({ type: 'qualifier', text: qualifier });
                tokens.push({ type: 'colon', text: match[2] });
                tokens.push({ type: 'value', text: match[3] });
            } else {
                // Unknown qualifier - treat as plain text
                tokens.push({ type: 'text', text: match[0] });
            }
        } else if (match[4]) {
            // Whitespace
            tokens.push({ type: 'whitespace', text: match[4] });
        } else if (match[5]) {
            // Plain text
            tokens.push({ type: 'text', text: match[5] });
        }
        
        lastIndex = match.index + match[0].length;
    }
    
    // Add any remaining text
    if (lastIndex < query.length) {
        tokens.push({
            type: 'text',
            text: query.substring(lastIndex)
        });
    }
    
    return tokens;
}

/**
 * Converts tokens to styled HTML for display
 */
export function tokensToStyledHtml(tokens: SearchToken[]): string {
    return tokens.map(token => {
        const escapedText = escapeHtml(token.text);
        
        switch (token.type) {
            case 'qualifier':
                return `<span class="text-foreground font-medium">${escapedText}</span>`;
            case 'colon':
                return `<span class="text-foreground">${escapedText}</span>`;
            case 'value':
                return `<span class="text-blue-500 dark:text-blue-400">${escapedText}</span>`;
            case 'whitespace':
                return escapedText;
            case 'text':
                return `<span class="text-gray-600 dark:text-gray-300">${escapedText}</span>`;
            default:
                return escapedText;
        }
    }).join('');
}
