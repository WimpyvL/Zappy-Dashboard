import { format } from 'prettier';
import { compile } from 'handlebars';
import { marked } from 'marked';
import hljs from 'highlight.js';
import { OpenAPIV3 } from 'openapi-types';

/**
 * Template Helper Functions
 * Used across documentation templates for consistent formatting and presentation
 */

export const helpers = {
  /**
   * Format text as code with syntax highlighting
   */
  code(text: string, language = 'typescript'): string {
    try {
      const highlighted = hljs.highlight(text, { language }).value;
      return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`;
    } catch (error) {
      console.warn(`Failed to highlight code for language ${language}`);
      return `<pre><code>${text}</code></pre>`;
    }
  },

  /**
   * Format JSON with proper indentation
   */
  formatJson(obj: any): string {
    try {
      return format(JSON.stringify(obj), {
        parser: 'json',
        printWidth: 80,
      });
    } catch (error) {
      console.warn('Failed to format JSON');
      return JSON.stringify(obj, null, 2);
    }
  },

  /**
   * Format YAML with proper indentation
   */
  formatYaml(obj: any): string {
    try {
      return format(obj, {
        parser: 'yaml',
        printWidth: 80,
      });
    } catch (error) {
      console.warn('Failed to format YAML');
      return obj;
    }
  },

  /**
   * Format dates consistently
   */
  formatDate(date: string | Date): string {
    return new Date(date).toISOString().split('T')[0];
  },

  /**
   * Convert markdown to HTML
   */
  markdown(text: string): string {
    return marked(text);
  },

  /**
   * Create table of contents from headings
   */
  tableOfContents(content: string): string {
    const headings = content.match(/^#{2,3} .+$/gm) || [];
    return headings
      .map((heading) => {
        const level = heading.match(/^(#{2,3})/)?.[0].length - 1;
        const text = heading.replace(/^#{2,3} /, '');
        const anchor = text.toLowerCase().replace(/[^\w]+/g, '-');
        const indent = '  '.repeat(level - 1);
        return `${indent}- [${text}](#${anchor})`;
      })
      .join('\n');
  },

  /**
   * Format OpenAPI operation
   */
  formatOperation(operation: OpenAPIV3.OperationObject): string {
    const summary = operation.summary ? `\n\n${operation.summary}` : '';
    const description = operation.description ? `\n\n${operation.description}` : '';
    const params = operation.parameters
      ? '\n\n### Parameters\n\n' + formatParameters(operation.parameters)
      : '';
    const responses = operation.responses
      ? '\n\n### Responses\n\n' + formatResponses(operation.responses)
      : '';

    return `${summary}${description}${params}${responses}`;
  },

  /**
   * Format TypeScript type/interface definition
   */
  formatType(type: string): string {
    try {
      return format(type, {
        parser: 'typescript',
        printWidth: 80,
        semi: true,
        singleQuote: true,
      });
    } catch (error) {
      console.warn('Failed to format TypeScript');
      return type;
    }
  },

  /**
   * Format SQL query
   */
  formatSql(sql: string): string {
    try {
      return format(sql, {
        parser: 'postgresql',
        printWidth: 80,
      });
    } catch (error) {
      console.warn('Failed to format SQL');
      return sql;
    }
  },

  /**
   * Create anchor link
   */
  anchor(text: string): string {
    return text.toLowerCase().replace(/[^\w]+/g, '-');
  },

  /**
   * Format file size
   */
  fileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unit = 0;
    while (size >= 1024 && unit < units.length - 1) {
      size /= 1024;
      unit++;
    }
    return `${Math.round(size * 100) / 100} ${units[unit]}`;
  },

  /**
   * Create version badge
   */
  versionBadge(version: string): string {
    return `![version](https://img.shields.io/badge/version-${version}-blue)`;
  },

  /**
   * Create status badge
   */
  statusBadge(status: string): string {
    const colors: { [key: string]: string } = {
      stable: 'green',
      beta: 'yellow',
      alpha: 'orange',
      deprecated: 'red',
    };
    return `![status](https://img.shields.io/badge/status-${status}-${colors[status] || 'grey'})`;
  },
};

// Helper Functions

function formatParameters(parameters: OpenAPIV3.ParameterObject[]): string {
  return parameters
    .map((param) => {
      const required = param.required ? '**Required**. ' : '';
      return `- \`${param.name}\` *(${param.in})*: ${required}${param.description}`;
    })
    .join('\n');
}

function formatResponses(responses: OpenAPIV3.ResponsesObject): string {
  return Object.entries(responses)
    .map(([code, response]) => {
      if (!('description' in response)) return '';
      return `- \`${code}\`: ${response.description}`;
    })
    .filter(Boolean)
    .join('\n');
}

// Register Helpers
Object.entries(helpers).forEach(([name, helper]) => {
  compile.registerHelper(name, helper);
});

export default helpers;