/**
 * Parse markdown text and convert to formatted HTML
 * Handles: bold, italic, bullet points, numbered lists
 */
export function parseMarkdownToHTML(text: string): string {
    if (!text || typeof text !== 'string') return ''
    let html = text

    // Convert **bold** to <strong>
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')

    // Convert *italic* to <em>
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')

    // Convert bullet points (* item) to proper list items
    const lines = html.split('\n')
    let inList = false
    const processedLines: string[] = []

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()

        // Check if line is a bullet point
        if (line.startsWith('* ')) {
            if (!inList) {
                processedLines.push('<ul class="list-disc ml-6 mt-2 space-y-1">')
                inList = true
            }
            const content = line.substring(2).trim()
            processedLines.push(`<li>${content}</li>`)
        } else if (line.startsWith('- ')) {
            if (!inList) {
                processedLines.push('<ul class="list-disc ml-6 mt-2 space-y-1">')
                inList = true
            }
            const content = line.substring(2).trim()
            processedLines.push(`<li>${content}</li>`)
        } else {
            if (inList) {
                processedLines.push('</ul>')
                inList = false
            }
            if (line) {
                processedLines.push(`<p class="mb-2">${line}</p>`)
            }
        }
    }

    // Close list if still open
    if (inList) {
        processedLines.push('</ul>')
    }

    return processedLines.join('\n')
}