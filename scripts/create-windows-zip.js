import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

const IGNORED_DIRS = new Set([
  'node_modules',
  'dist',
  'dev-dist',
  'release',
  '.git',
  '.cache',
  'target'
]);

const IGNORED_FILES = new Set([
  '.DS_Store',
  'om-lifeos-windows-tauri.zip'
]);

async function addDirectory(zip, currentPath, rootDir) {
  const entries = fs.readdirSync(currentPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(currentPath, entry.name);
    const relativePath = path.relative(rootDir, fullPath);

    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      if (relativePath.includes('src-tauri/target') || relativePath.includes('src-tauri\\target')) continue;
      const folderZip = zip.folder(relativePath.replace(/\\/g, '/'));
      await addDirectory(zip, fullPath, rootDir);
    } else {
      if (IGNORED_FILES.has(entry.name)) continue;
      if (entry.name.endsWith('.zip')) continue;
      const fileData = fs.readFileSync(fullPath);
      zip.file(relativePath.replace(/\\/g, '/'), fileData);
    }
  }
}

async function main() {
  const rootDir = process.cwd();
  const zip = new JSZip();

  console.log('Archiving Om-LifeOS clean repository for Windows Tauri build...');
  await addDirectory(zip, rootDir, rootDir);

  const content = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 }
  });

  const zipPath = path.join(rootDir, 'om-lifeos-windows-tauri.zip');
  const publicZipPath = path.join(rootDir, 'public', 'om-lifeos-windows-tauri.zip');

  fs.writeFileSync(zipPath, content);
  fs.writeFileSync(publicZipPath, content);

  console.log(`Zip successfully created: ${content.length} bytes at:`);
  console.log(`- ${zipPath}`);
  console.log(`- ${publicZipPath}`);
}

main().catch(err => {
  console.error('Failed to create zip:', err);
  process.exit(1);
});
