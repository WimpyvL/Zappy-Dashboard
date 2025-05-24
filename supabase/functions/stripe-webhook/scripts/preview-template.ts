#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { program } from 'commander';
import { compile } from 'handlebars';
import { marked } from 'marked';
import chalk from 'chalk';
import express from 'express';
import { watch } from 'chokidar';
import WebSocket from 'ws';
import helpers from './helpers/template';

program
  .name('preview-template')
  .description('Preview documentation templates with live reload')
  .requiredOption('-t, --template <name>', 'Template name')
  .option('-d, --data <path>', 'Data file path')
  .option('-p, --port <number>', 'Preview server port', '3000')
  .option('-w, --watch', 'Watch for changes', false)
  .parse(process.argv);

const options = program.opts();

interface PreviewData {
  content: string;
  timestamp: string;
}

async function previewTemplate() {
  try {
    // Start preview server
    const { app, wss } = setupServer();
    
    // Load template and data
    let template = loadTemplate(options.template);
    let data = loadData(options.data);

    // Initial render
    let content = renderTemplate(template, data);
    broadcastUpdate(wss, content);

    // Watch for changes if enabled
    if (options.watch) {
      watchFiles(wss, template, data);
    }

    // Start server
    const port = parseInt(options.port);
    app.listen(port, () => {
      console.log(chalk.green(`\n✨ Preview available at http://localhost:${port}`));
      console.log(chalk.blue('📝 Template:'), options.template);
      console.log(chalk.blue('📊 Data:'), options.data || 'example data');
      if (options.watch) {
        console.log(chalk.yellow('\n👀 Watching for changes...'));
      }
    });

  } catch (error) {
    console.error(chalk.red('\n❌ Preview failed:'), error);
    process.exit(1);
  }
}

function setupServer() {
  const app = express();
  const wss = new WebSocket.Server({ noServer: true });

  // Serve preview page
  app.get('/', (req, res) => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Template Preview</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@docsearch/css@3"/>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
          }
          .preview {
            border: 1px solid #e0e0e0;
            border-radius: 4px;
            padding: 2rem;
            margin: 2rem 0;
          }
          .toolbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            background: #f5f5f5;
            border-radius: 4px;
          }
          .status {
            font-size: 0.875rem;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="toolbar">
          <div>
            <strong>Template:</strong> ${options.template}
            <br>
            <strong>Data:</strong> ${options.data || 'example data'}
          </div>
          <div class="status">
            Last updated: <span id="timestamp">-</span>
          </div>
        </div>
        <div class="preview" id="content"></div>
        <script>
          const ws = new WebSocket('ws://' + location.host);
          
          ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            document.getElementById('content').innerHTML = data.content;
            document.getElementById('timestamp').textContent = data.timestamp;
          };

          ws.onclose = () => {
            console.log('Connection closed. Retrying...');
            setTimeout(() => location.reload(), 1000);
          };
        </script>
      </body>
      </html>
    `;
    res.send(html);
  });

  return { app, wss };
}

function loadTemplate(name: string): string {
  try {
    const path = resolve(__dirname, 'templates', `${name}.hbs`);
    return readFileSync(path, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to load template: ${error.message}`);
  }
}

function loadData(path?: string): any {
  try {
    if (!path) {
      return getExampleData();
    }
    const content = readFileSync(resolve(path), 'utf-8');
    return path.endsWith('.json') ? JSON.parse(content) : loadYaml(content);
  } catch (error) {
    throw new Error(`Failed to load data: ${error.message}`);
  }
}

function renderTemplate(template: string, data: any): string {
  try {
    const compiledTemplate = compile(template);
    const markdown = compiledTemplate({ ...data, helpers });
    return marked(markdown);
  } catch (error) {
    return `<pre class="error">Error rendering template: ${error.message}</pre>`;
  }
}

function broadcastUpdate(wss: WebSocket.Server, content: string) {
  const data: PreviewData = {
    content,
    timestamp: new Date().toLocaleTimeString(),
  };

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

function watchFiles(wss: WebSocket.Server, template: string, data: any) {
  const watcher = watch([
    resolve(__dirname, 'templates', `${options.template}.hbs`),
    options.data ? resolve(options.data) : [],
  ].filter(Boolean));

  watcher.on('change', async (path) => {
    console.log(chalk.yellow(`\n📝 File changed: ${path}`));
    
    try {
      if (path.endsWith('.hbs')) {
        template = loadTemplate(options.template);
      } else {
        data = loadData(options.data);
      }

      const content = renderTemplate(template, data);
      broadcastUpdate(wss, content);
      
      console.log(chalk.green('✨ Preview updated'));
    } catch (error) {
      console.error(chalk.red('❌ Update failed:'), error);
    }
  });
}

function getExampleData(): any {
  return {
    title: 'Example Documentation',
    description: 'This is an example template preview.',
    sections: [
      {
        title: 'Introduction',
        content: 'Example content for the template.',
      },
      {
        title: 'Features',
        items: [
          'Live preview',
          'Hot reload',
          'Example data',
        ],
      },
    ],
    code: {
      language: 'typescript',
      content: `function example() {
  console.log('Hello, World!');
}`,
    },
  };
}

// Run preview
previewTemplate().catch((error) => {
  console.error(chalk.red('💥 Fatal error:'), error);
  process.exit(1);
});