import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Đang build ViTudy cho GitHub Pages (Static Export)...');
process.env.GITHUB_PAGES = 'true';
process.env.NEXT_PUBLIC_BASE_PATH = '/ViTudy';

const apiDir = path.resolve(process.cwd(), 'src/app/api');
const tempApiDir = path.resolve(process.cwd(), 'src/app/_api_temp_pages');
const hasApiDir = fs.existsSync(apiDir);

try {
  if (hasApiDir) {
    fs.renameSync(apiDir, tempApiDir);
  }
  execSync('next build', { stdio: 'inherit', env: process.env });
} finally {
  if (hasApiDir && fs.existsSync(tempApiDir)) {
    fs.renameSync(tempApiDir, apiDir);
  }
}

const outDir = path.resolve(process.cwd(), 'out');
const noJekyllPath = path.join(outDir, '.nojekyll');

if (fs.existsSync(outDir)) {
  fs.writeFileSync(noJekyllPath, '');
  console.log('✅ Đã tạo file out/.nojekyll cho GitHub Pages.');
}

console.log('✨ Build thành công! Thư mục out/ đã sẵn sàng để deploy lên GitHub Pages.');
