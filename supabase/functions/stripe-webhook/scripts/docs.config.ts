import { DocsConfig } from './types/docs-config';

/**
 * Documentation Configuration
 * Controls generation, validation, and deployment of documentation
 */
export const config: DocsConfig = {
  project: {
    name: 'stripe-webhook',
    version: '1.0.0',
    description: 'Stripe webhook handler documentation',
    repository: 'https://github.com/supabase/stripe-webhook',
    homepage: 'https://docs.supabase.com/stripe-webhook',
    license: 'MIT',
    author: {
      name: 'Supabase',
      email: 'support@supabase.com',
      url: 'https://supabase.com'
    }
  },

  paths: {
    docs: 'docs',
    source: 'src',
    output: {
      typedoc: 'docs/api',
      openapi: 'docs/openapi.json',
      markdown: 'docs',
      types: 'src/types/generated.ts'
    },
    templates: {
      path: 'scripts/templates',
      data: 'scripts/data',
      helpers: 'scripts/helpers'
    }
  },

  templates: {
    default: 'default',
    templates: [
      {
        name: 'api',
        path: 'templates/api.hbs',
        data: 'data/api.yml',
        output: 'docs/api/',
        helpers: ['api-helpers']
      },
      {
        name: 'config',
        path: 'templates/config.hbs',
        data: 'data/config.yml',
        output: 'docs/config/',
        helpers: ['config-helpers']
      },
      {
        name: 'example',
        path: 'templates/example.hbs',
        data: 'data/examples.yml',
        output: 'docs/examples/',
        helpers: ['example-helpers']
      }
    ]
  },

  generation: {
    typedoc: {
      entryPoints: ['src/index.ts'],
      out: 'docs/api',
      theme: 'default',
      plugin: ['typedoc-plugin-markdown']
    },
    openapi: {
      title: 'Stripe Webhook API',
      version: '1.0.0',
      description: 'API documentation for Stripe webhook handler',
      servers: [
        {
          url: 'https://api.example.com',
          description: 'Production server'
        }
      ]
    },
    markdown: {
      include: [
        '**/*.md',
        '**/*.mdx'
      ],
      exclude: [
        'node_modules',
        '.git',
        'dist'
      ],
      plugins: [
        'remark-frontmatter',
        'remark-gfm'
      ]
    }
  },

  validation: {
    links: {
      checkExternal: true,
      ignore: [
        'http://localhost',
        'https://example.com'
      ],
      timeout: 5000
    },
    content: {
      minWords: 50,
      maxWords: 1000,
      requiredSections: [
        'Introduction',
        'Usage',
        'Examples'
      ]
    },
    code: {
      lint: true,
      test: true,
      format: true
    }
  },

  output: {
    clean: true,
    assets: {
      from: 'assets',
      to: 'docs/assets',
      include: ['**/*']
    },
    search: {
      enabled: true,
      output: 'docs/search.json',
      options: {
        fields: ['title', 'content'],
        boosts: {
          title: 2,
          content: 1
        }
      }
    }
  },

  versioning: {
    enabled: true,
    dir: 'versions',
    latest: 'latest',
    format: 'v${major}.${minor}.${patch}',
    archive: {
      enabled: true,
      path: 'archive',
      keep: 5
    }
  },

  analysis: {
    thresholds: {
      score: 80,
      coverage: 90,
      readability: 70
    },
    weights: {
      spelling: 1,
      formatting: 2,
      structure: 5,
      content: {
        low: 2,
        medium: 5,
        high: 10
      }
    },
    ignore: {
      files: [
        'CHANGELOG.md',
        'LICENSE.md'
      ],
      issues: [
        'WS-001', // Whitespace issue
        'FMT-002'  // Format issue
      ]
    }
  }
};

export default config;