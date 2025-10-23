#!/usr/bin/env node

/**
 * 自动更新版本号脚本
 * 使用方法: node update-version.js 4.2
 */

const fs = require('fs');
const path = require('path');

// 获取命令行参数
const newVersion = process.argv[2];

if (!newVersion) {
  console.error('❌ 错误: 请提供新版本号');
  console.log('使用方法: node update-version.js 4.2');
  process.exit(1);
}

// 验证版本号格式
if (!/^\d+\.\d+$/.test(newVersion)) {
  console.error('❌ 错误: 版本号格式不正确 (应该是 x.y 格式,例如 4.2)');
  process.exit(1);
}

const versionWithV = `v${newVersion}`;

console.log(`🚀 开始更新版本到 ${versionWithV}...\n`);

// 文件路径
const swPath = path.join(__dirname, 'sw.js');
const indexPath = path.join(__dirname, 'index.html');

let updateCount = 0;

// 更新 sw.js
try {
  let swContent = fs.readFileSync(swPath, 'utf8');
  const swOriginal = swContent;
  
  swContent = swContent.replace(
    /const CACHE_VERSION = 'v[\d.]+'/,
    `const CACHE_VERSION = '${versionWithV}'`
  );
  
  if (swContent !== swOriginal) {
    fs.writeFileSync(swPath, swContent, 'utf8');
    console.log('✅ 已更新 sw.js');
    updateCount++;
  } else {
    console.log('⚠️  sw.js 未找到版本号或已是最新版本');
  }
} catch (error) {
  console.error('❌ 更新 sw.js 失败:', error.message);
}

// 更新 index.html
try {
  let indexContent = fs.readFileSync(indexPath, 'utf8');
  const indexOriginal = indexContent;
  
  // 更新 meta 标签中的版本
  indexContent = indexContent.replace(
    /<meta name="app-version" content="[\d.]+"/,
    `<meta name="app-version" content="${newVersion}"`
  );
  
  // 更新 CSS 链接中的版本
  indexContent = indexContent.replace(
    /href="style\.css\?v=[\d.]+"/,
    `href="style.css?v=${newVersion}"`
  );
  
  // 更新导航栏显示的版本
  indexContent = indexContent.replace(
    />v[\d.]+</g,
    `>${versionWithV}<`
  );
  
  // 更新 JS 脚本中的版本
  indexContent = indexContent.replace(
    /src="app\.js\?v=[\d.]+"/,
    `src="app.js?v=${newVersion}"`
  );
  
  if (indexContent !== indexOriginal) {
    fs.writeFileSync(indexPath, indexContent, 'utf8');
    console.log('✅ 已更新 index.html');
    updateCount++;
  } else {
    console.log('⚠️  index.html 未找到版本号或已是最新版本');
  }
} catch (error) {
  console.error('❌ 更新 index.html 失败:', error.message);
}

// 总结
console.log('\n' + '='.repeat(50));
if (updateCount > 0) {
  console.log(`✅ 版本更新完成! 共更新了 ${updateCount} 个文件`);
  console.log(`📦 新版本: ${versionWithV}`);
  console.log('\n下一步:');
  console.log('1. 检查更改: git diff');
  console.log('2. 提交代码: git add . && git commit -m "Update to ' + versionWithV + '"');
  console.log('3. 推送部署: git push');
} else {
  console.log('⚠️  没有文件被更新');
}
console.log('='.repeat(50));

