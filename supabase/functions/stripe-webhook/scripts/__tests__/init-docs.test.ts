import { resolve } from 'path';
import { mkdtemp, readdir, readFile, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { execSync } from 'child_process';

describe('Documentation Initialization', () => {
  let testDir: string;

  beforeEach(async () => {
    // Create temporary test directory
    testDir = await mkdtemp(join(tmpdir(), 'docs-test-'));
    process.chdir(testDir);
  });

  afterEach(async () => {
    // Clean up test directory
    await rm(testDir, { recursive: true, force: true });
  });

  describe('Directory Creation', () => {
    it('should create all required directories', async () => {
      // Run initialization
      execSync('ts-node ../init-docs.ts', { stdio: 'ignore' });

      // Check directories
      const expectedDirs = [
        'docs',
        'docs/api',
        'docs/examples',
        'docs/guides',
        'docs/assets',
        'templates',
        'templates/themes',
        'templates/data',
        'templates/helpers',
        'schemas',
        '__tests__',
        '__tests__/__fixtures__',
      ];

      for (const dir of expectedDirs) {
        const exists = await directoryExists(dir);
        expect(exists).toBe(true);
      }
    });

    it('should handle existing directories', async () => {
      // Create a directory that should be created by init
      await mkdir('docs');

      // Run initialization
      execSync('ts-node ../init-docs.ts', { stdio: 'ignore' });

      // Directory should still exist
      const exists = await directoryExists('docs');
      expect(exists).toBe(true);
    });
  });

  describe('File Creation', () => {
    it('should create all required files', async () => {
      // Run initialization
      execSync('ts-node ../init-docs.ts', { stdio: 'ignore' });

      // Check files
      const expectedFiles = [
        'docs/index.md',
        'docs/README.md',
        'templates/themes/default.yml',
        'templates/themes/config.yml',
        '.gitignore',
        'docs/search-index.json',
      ];

      for (const file of expectedFiles) {
        const exists = await fileExists(file);
        expect(exists).toBe(true);
      }
    });

    it('should not overwrite existing files by default', async () => {
      // Create a file with custom content
      const customContent = '# Custom Content';
      await writeFile('docs/index.md', customContent);

      // Run initialization
      execSync('ts-node ../init-docs.ts', { stdio: 'ignore' });

      // File should retain custom content
      const content = await readFile('docs/index.md', 'utf-8');
      expect(content).toBe(customContent);
    });

    it('should overwrite files with --force flag', async () => {
      // Create a file with custom content
      await writeFile('docs/index.md', '# Custom Content');

      // Run initialization with force
      execSync('ts-node ../init-docs.ts --force', { stdio: 'ignore' });

      // File should be overwritten
      const content = await readFile('docs/index.md', 'utf-8');
      expect(content).not.toBe('# Custom Content');
    });
  });

  describe('Git Integration', () => {
    it('should initialize Git repository', async () => {
      // Run initialization
      execSync('ts-node ../init-docs.ts', { stdio: 'ignore' });

      // Check Git repository
      const isGitRepo = await directoryExists('.git');
      expect(isGitRepo).toBe(true);
    });

    it('should skip Git with --skip-git flag', async () => {
      // Run initialization with skip-git
      execSync('ts-node ../init-docs.ts --skip-git', { stdio: 'ignore' });

      // Git repository should not exist
      const isGitRepo = await directoryExists('.git');
      expect(isGitRepo).toBe(false);
    });

    it('should create initial commit', async () => {
      // Run initialization
      execSync('ts-node ../init-docs.ts', { stdio: 'ignore' });

      // Check Git history
      const log = execSync('git log --oneline').toString();
      expect(log).toContain('docs: initial documentation setup');
    });
  });

  describe('Dependencies', () => {
    it('should install dependencies', async () => {
      // Run initialization
      execSync('ts-node ../init-docs.ts', { stdio: 'ignore' });

      // Check node_modules
      const hasNodeModules = await directoryExists('node_modules');
      expect(hasNodeModules).toBe(true);
    });

    it('should skip installation with --skip-install flag', async () => {
      // Run initialization with skip-install
      execSync('ts-node ../init-docs.ts --skip-install', { stdio: 'ignore' });

      // node_modules should not exist
      const hasNodeModules = await directoryExists('node_modules');
      expect(hasNodeModules).toBe(false);
    });
  });

  describe('Content Generation', () => {
    it('should generate valid index content', async () => {
      // Run initialization
      execSync('ts-node ../init-docs.ts', { stdio: 'ignore' });

      // Check index content
      const content = await readFile('docs/index.md', 'utf-8');
      expect(content).toContain('# ');
      expect(content).toContain('## Getting Started');
      expect(content).toContain('[Installation]');
      expect(content).toContain('[API Overview]');
    });

    it('should generate valid README content', async () => {
      // Run initialization
      execSync('ts-node ../init-docs.ts', { stdio: 'ignore' });

      // Check README content
      const content = await readFile('docs/README.md', 'utf-8');
      expect(content).toContain('# Documentation');
      expect(content).toContain('## Structure');
      expect(content).toContain('## Contributing');
    });

    it('should generate valid theme configuration', async () => {
      // Run initialization
      execSync('ts-node ../init-docs.ts', { stdio: 'ignore' });

      // Check theme config
      const content = await readFile('templates/themes/config.yml', 'utf-8');
      expect(content).toContain('name: default');
      expect(content).toContain('colors:');
      expect(content).toContain('typography:');
      expect(content).toContain('layout:');
    });
  });
});

// Helper functions
async function directoryExists(path: string): Promise<boolean> {
  try {
    const stat = await fs.stat(path);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

async function fileExists(path: string): Promise<boolean> {
  try {
    const stat = await fs.stat(path);
    return stat.isFile();
  } catch {
    return false;
  }
}

async function writeFile(path: string, content: string): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await fs.writeFile(path, content);
}

async function mkdir(path: string): Promise<void> {
  await fs.mkdir(path, { recursive: true });
}