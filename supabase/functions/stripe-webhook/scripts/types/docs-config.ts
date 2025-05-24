/**
 * Documentation Configuration Types
 * Defines types for documentation generation and management
 */

/**
 * Main documentation configuration
 */
export interface DocsConfig {
  /** Project information */
  project: ProjectConfig;
  /** File paths configuration */
  paths: PathsConfig;
  /** Template configuration */
  templates: TemplateConfig;
  /** Generation settings */
  generation: GenerationConfig;
  /** Validation rules */
  validation: ValidationConfig;
  /** Output settings */
  output: OutputConfig;
  /** Version management */
  versioning: VersionConfig;
}

/**
 * Project configuration
 */
export interface ProjectConfig {
  /** Project name */
  name: string;
  /** Project version */
  version: string;
  /** Project description */
  description: string;
  /** Repository URL */
  repository: string;
  /** Documentation homepage */
  homepage: string;
  /** License */
  license: string;
  /** Author information */
  author: {
    name: string;
    email: string;
    url: string;
  };
}

/**
 * File path configuration
 */
export interface PathsConfig {
  /** Root documentation directory */
  docs: string;
  /** Source code directory */
  source: string;
  /** Output paths for generated files */
  output: {
    /** TypeDoc output */
    typedoc: string;
    /** OpenAPI spec output */
    openapi: string;
    /** Markdown output */
    markdown: string;
    /** Generated types output */
    types: string;
  };
  /** Template directories */
  templates: {
    /** Path to template files */
    path: string;
    /** Path to template data */
    data: string;
    /** Path to template helpers */
    helpers: string;
  };
}

/**
 * Template configuration
 */
export interface TemplateConfig {
  /** Default template */
  default: string;
  /** Available templates */
  templates: {
    /** Template name */
    name: string;
    /** Template file path */
    path: string;
    /** Template data path */
    data: string;
    /** Template output path */
    output: string;
    /** Template helpers */
    helpers?: string[];
  }[];
}

/**
 * Documentation generation configuration
 */
export interface GenerationConfig {
  /** TypeDoc configuration */
  typedoc: {
    /** Entry points */
    entryPoints: string[];
    /** Output options */
    out: string;
    /** Theme settings */
    theme: string;
    /** Plugin settings */
    plugin: string[];
  };
  /** OpenAPI configuration */
  openapi: {
    /** API title */
    title: string;
    /** API version */
    version: string;
    /** API description */
    description: string;
    /** Server configuration */
    servers: {
      url: string;
      description: string;
    }[];
  };
  /** Markdown configuration */
  markdown: {
    /** Include files */
    include: string[];
    /** Exclude patterns */
    exclude: string[];
    /** Custom plugins */
    plugins: string[];
  };
}

/**
 * Validation configuration
 */
export interface ValidationConfig {
  /** Link validation */
  links: {
    /** Check external links */
    checkExternal: boolean;
    /** Ignore patterns */
    ignore: string[];
    /** Timeout in ms */
    timeout: number;
  };
  /** Content validation */
  content: {
    /** Minimum word count */
    minWords: number;
    /** Maximum word count */
    maxWords: number;
    /** Required sections */
    requiredSections: string[];
  };
  /** Code validation */
  code: {
    /** Lint code examples */
    lint: boolean;
    /** Test code examples */
    test: boolean;
    /** Format code */
    format: boolean;
  };
}

/**
 * Output configuration
 */
export interface OutputConfig {
  /** Clean output directory */
  clean: boolean;
  /** Copy assets */
  assets: {
    /** Source directory */
    from: string;
    /** Target directory */
    to: string;
    /** Files to copy */
    include: string[];
  };
  /** Search index generation */
  search: {
    /** Enable search */
    enabled: boolean;
    /** Index file path */
    output: string;
    /** Index options */
    options: {
      /** Fields to index */
      fields: string[];
      /** Field boosts */
      boosts: Record<string, number>;
    };
  };
}

/**
 * Version configuration
 */
export interface VersionConfig {
  /** Enable versioning */
  enabled: boolean;
  /** Version directory */
  dir: string;
  /** Latest version tag */
  latest: string;
  /** Version format */
  format: string;
  /** Archive settings */
  archive: {
    /** Enable archiving */
    enabled: boolean;
    /** Archive path */
    path: string;
    /** Keep versions */
    keep: number;
  };
}

/**
 * Profile configuration
 */
export interface ProfileConfig {
  /** Profile name */
  name: string;
  /** Profile description */
  description: string;
  /** Creation date */
  created: string;
  /** Last updated */
  updated: string;
  /** Profile configuration */
  config: Partial<DocsConfig>;
}

/**
 * Analysis configuration
 */
export interface AnalysisConfig {
  /** Quality thresholds */
  thresholds: {
    /** Overall score threshold */
    score: number;
    /** Coverage threshold */
    coverage: number;
    /** Readability threshold */
    readability: number;
  };
  /** Issue weights */
  weights: {
    /** Spelling issues */
    spelling: number;
    /** Formatting issues */
    formatting: number;
    /** Structure issues */
    structure: number;
    /** Content issues */
    content: Record<'low' | 'medium' | 'high', number>;
  };
  /** Ignore patterns */
  ignore: {
    /** Files to ignore */
    files: string[];
    /** Issues to ignore */
    issues: string[];
  };
}

/**
 * Default configuration
 */
export const defaultConfig: DocsConfig = {
  project: {
    name: 'project',
    version: '1.0.0',
    description: 'Project documentation',
    repository: '',
    homepage: '',
    license: 'MIT',
    author: {
      name: '',
      email: '',
      url: '',
    },
  },
  paths: {
    docs: 'docs',
    source: 'src',
    output: {
      typedoc: 'docs/api',
      openapi: 'docs/openapi.json',
      markdown: 'docs',
      types: 'src/types/generated.ts',
    },
    templates: {
      path: 'scripts/templates',
      data: 'scripts/data',
      helpers: 'scripts/helpers',
    },
  },
  templates: {
    default: 'default',
    templates: [],
  },
  generation: {
    typedoc: {
      entryPoints: ['src/index.ts'],
      out: 'docs/api',
      theme: 'default',
      plugin: [],
    },
    openapi: {
      title: 'API Documentation',
      version: '1.0.0',
      description: '',
      servers: [],
    },
    markdown: {
      include: ['**/*.md'],
      exclude: ['node_modules'],
      plugins: [],
    },
  },
  validation: {
    links: {
      checkExternal: true,
      ignore: [],
      timeout: 5000,
    },
    content: {
      minWords: 50,
      maxWords: 1000,
      requiredSections: ['Introduction', 'Usage', 'Examples'],
    },
    code: {
      lint: true,
      test: true,
      format: true,
    },
  },
  output: {
    clean: true,
    assets: {
      from: 'assets',
      to: 'docs/assets',
      include: ['**/*'],
    },
    search: {
      enabled: true,
      output: 'docs/search.json',
      options: {
        fields: ['title', 'content'],
        boosts: {
          title: 2,
          content: 1,
        },
      },
    },
  },
  versioning: {
    enabled: true,
    dir: 'versions',
    latest: 'latest',
    format: 'v${major}.${minor}.${patch}',
    archive: {
      enabled: true,
      path: 'archive',
      keep: 5,
    },
  },
};