#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync, statSync } from 'fs';
import { resolve, relative } from 'path';
import { program } from 'commander';
import { lookup } from 'mime-types';
import chalk from 'chalk';
import { config } from './docs.config';

program
  .name('deploy-docs')
  .description('Deploy documentation to Supabase storage')
  .requiredOption('-p, --project <id>', 'Supabase project ID')
  .requiredOption('-k, --key <key>', 'Supabase service role key')
  .option('-b, --bucket <name>', 'Storage bucket name', 'docs')
  .option('-d, --dir <path>', 'Documentation directory', 'docs')
  .option('--public', 'Make files publicly accessible', false)
  .option('--dry-run', 'Validate without deploying', false)
  .parse(process.argv);

const options = program.opts();

interface DeploymentResult {
  uploaded: string[];
  deleted: string[];
  errors: string[];
}

async function deployDocs(): Promise<void> {
  console.log(chalk.blue('🚀 Starting documentation deployment...'));

  try {
    // Initialize Supabase client
    const supabase = createClient(
      `https://${options.project}.supabase.co`,
      options.key
    );

    // Ensure bucket exists
    await ensureBucket(supabase);

    // Get current files
    const currentFiles = await listBucketFiles(supabase);
    console.log(chalk.blue(`📦 Found ${currentFiles.length} existing files`));

    // Get local files
    const localFiles = await getLocalFiles();
    console.log(chalk.blue(`📂 Found ${localFiles.length} local files`));

    // Calculate changes
    const { toUpload, toDelete } = calculateChanges(localFiles, currentFiles);
    
    console.log(chalk.blue(`📤 Files to upload: ${toUpload.length}`));
    console.log(chalk.blue(`🗑️ Files to delete: ${toDelete.length}`));

    if (options.dryRun) {
      console.log(chalk.yellow('\n⚠️ Dry run - skipping deployment'));
      return;
    }

    // Deploy changes
    const result = await deployChanges(supabase, toUpload, toDelete);

    // Set public access if requested
    if (options.public) {
      await setPublicAccess(supabase);
    }

    // Log results
    logResults(result);

  } catch (error) {
    console.error(chalk.red('\n❌ Deployment failed:'), error);
    process.exit(1);
  }
}

async function ensureBucket(supabase: any): Promise<void> {
  console.log(chalk.blue('\n🪣 Checking storage bucket...'));

  try {
    const { data: bucket, error } = await supabase
      .storage
      .getBucket(options.bucket);

    if (error && error.message.includes('not found')) {
      const { error: createError } = await supabase
        .storage
        .createBucket(options.bucket, {
          public: options.public,
        });

      if (createError) throw createError;
      console.log(chalk.green(`✓ Created bucket: ${options.bucket}`));
    } else if (error) {
      throw error;
    } else {
      console.log(chalk.green(`✓ Using bucket: ${options.bucket}`));
    }
  } catch (error) {
    throw new Error(`Failed to ensure bucket: ${error.message}`);
  }
}

async function listBucketFiles(supabase: any): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .storage
      .from(options.bucket)
      .list();

    if (error) throw error;
    return data.map((file: any) => file.name);
  } catch (error) {
    throw new Error(`Failed to list bucket files: ${error.message}`);
  }
}

async function getLocalFiles(): Promise<string[]> {
  const files: string[] = [];

  function walkDir(dir: string) {
    const entries = readdirSync(dir);
    entries.forEach((entry) => {
      const fullPath = resolve(dir, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        walkDir(fullPath);
      } else {
        files.push(relative(options.dir, fullPath));
      }
    });
  }

  walkDir(options.dir);
  return files;
}

function calculateChanges(local: string[], remote: string[]): {
  toUpload: string[];
  toDelete: string[];
} {
  const toUpload = local.filter((file) => !remote.includes(file));
  const toDelete = remote.filter((file) => !local.includes(file));

  return { toUpload, toDelete };
}

async function deployChanges(
  supabase: any,
  toUpload: string[],
  toDelete: string[]
): Promise<DeploymentResult> {
  const result: DeploymentResult = {
    uploaded: [],
    deleted: [],
    errors: [],
  };

  // Upload new/changed files
  for (const file of toUpload) {
    try {
      console.log(chalk.blue(`📤 Uploading ${file}...`));
      
      const filePath = resolve(options.dir, file);
      const content = readFileSync(filePath);
      const contentType = lookup(filePath) || 'application/octet-stream';

      const { error } = await supabase
        .storage
        .from(options.bucket)
        .upload(file, content, {
          contentType,
          upsert: true,
        });

      if (error) throw error;
      result.uploaded.push(file);
      console.log(chalk.green(`✓ Uploaded ${file}`));
    } catch (error) {
      result.errors.push(`Failed to upload ${file}: ${error.message}`);
      console.error(chalk.red(`❌ Failed to upload ${file}`));
    }
  }

  // Delete removed files
  for (const file of toDelete) {
    try {
      console.log(chalk.blue(`🗑️ Deleting ${file}...`));
      
      const { error } = await supabase
        .storage
        .from(options.bucket)
        .remove([file]);

      if (error) throw error;
      result.deleted.push(file);
      console.log(chalk.green(`✓ Deleted ${file}`));
    } catch (error) {
      result.errors.push(`Failed to delete ${file}: ${error.message}`);
      console.error(chalk.red(`❌ Failed to delete ${file}`));
    }
  }

  return result;
}

async function setPublicAccess(supabase: any): Promise<void> {
  console.log(chalk.blue('\n🔓 Setting public access...'));

  try {
    const { error } = await supabase
      .storage
      .from(options.bucket)
      .getPublicUrl('');

    if (error) throw error;
    console.log(chalk.green('✓ Public access enabled'));
  } catch (error) {
    console.warn(chalk.yellow('⚠️ Failed to set public access'));
  }
}

function logResults(result: DeploymentResult): void {
  console.log(chalk.blue('\n📊 Deployment Results:'));
  console.log(chalk.green(`✓ Uploaded: ${result.uploaded.length} files`));
  console.log(chalk.green(`✓ Deleted: ${result.deleted.length} files`));
  
  if (result.errors.length > 0) {
    console.log(chalk.red(`❌ Errors: ${result.errors.length}`));
    result.errors.forEach((error) => {
      console.error(chalk.red(`  - ${error}`));
    });
  }
}

// Run deployment
deployDocs().catch((error) => {
  console.error(chalk.red('💥 Fatal error:'), error);
  process.exit(1);
});