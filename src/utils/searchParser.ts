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
