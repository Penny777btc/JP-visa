const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const htmlContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700;900&display=swap');
  * { box-sizing: border-box; }
  body { font-family: 'Noto Sans SC', sans-serif; color: #1e293b; font-size: 11px; line-height: 1.5; padding: 20px; background: #fff; }
  .header { border-bottom: 2px solid #3b82f6; padding-bottom: 12px; margin-bottom: 20px; text-align: center; }
  .header h1 { font-size: 20px; color: #1e40af; margin: 0 0 6px 0; }
  .header p { color: #64748b; margin: 0; font-size: 12px; }
  .score-box { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px 20px; border-radius: 8px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
  .score-title { font-weight: 700; color: #166534; font-size: 14px; margin-bottom: 4px;}
  .score-details { color: #15803d; font-size: 11px; }
  .score-number { font-size: 26px; font-weight: 900; color: #16a34a; }
  
  table { width: 100%; border-collapse: collapse; margin-bottom: 25px; table-layout: fixed; }
  th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; vertical-align: top; }
  th { background-color: #f1f5f9; color: #334155; font-weight: 700; font-size: 12px;}
  
  .category { width: 15%; font-weight: 700; color: #475569; background-color: #f8fafc; text-align: center; vertical-align: middle;}
  .item-name { width: 28%; font-weight: 700; color: #0f172a; }
  .checkbox { display: inline-block; width: 14px; height: 14px; border: 1px solid #94a3b8; border-radius: 3px; margin-right: 6px; position:relative; top: 2px; }
  .points { width: 15%; color: #0284c7; font-weight: 500; }
  .warnings { width: 42%; }
  
  .warning-box { background: #fffbeb; border-left: 3px solid #f59e0b; padding: 8px; margin-top: 6px; font-size: 10px; border-radius: 0 4px 4px 0;}
  .danger-box { background: #fef2f2; border-left: 3px solid #ef4444; padding: 8px; margin-top: 6px; font-size: 10px; border-radius: 0 4px 4px 0;}
  .danger-box b { color: #b91c1c; }
  ul { padding-left: 16px; margin: 4px 0 0 0; }
  li { margin-bottom: 3px; }
  
  .footer { margin-top: 30px; padding-top: 15px; border-top: 1px dashed #cbd5e1; color: #94a3b8; font-size: 10px; text-align: center; }
</style>
</head>
<body>

<div class="header">
  <h1>高度人才（80分）专属申请材料 CheckList</h1>
  <p>个人情况建模：35岁 / 本科学历 / 10年工作经验 / 年薪600万日元 / JLPT N2 / 发明专利1件</p>
</div>

<div class="score-box">
  <div>
    <div class="score-title">✅ 恭喜！您已成功达到 80 分顶级门槛</div>
    <div class="score-details">（1年快速拿永住资格）：学历(10) + 职历(20) + 年收(20) + 年龄(5) + 日语(10) + 专利(15)</div>
  </div>
  <div class="score-number">80 pt</div>
</div>

<table>
  <thead>
    <tr>
      <th class="category">资料分类</th>
      <th class="item-name">所需资料名称</th>
      <th class="points">对应加分项</th>
      <th class="warnings">⚠️ 核心注意事项与避坑指南</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="category" rowspan="3">基础文件</td>
      <td class="item-name"><div class="checkbox"></div>1. 在留/永住许可申请书</td>
      <td class="points">基础要求</td>
      <td class="warnings">贴好 3个月内照片 (4×3cm)。</td>
    </tr>
    <tr>
      <td class="item-name"><div class="checkbox"></div>2. 积分计算表(80分版)</td>
      <td class="points">积分申报</td>
      <td class="warnings">精确勾选，不加分的切勿勾选。</td>
    </tr>
    <tr>
      <td class="item-name"><div class="checkbox"></div>3. 护照与在留卡</td>
      <td class="points">身份验证</td>
      <td class="warnings">提交复印件，递交时需出示原件。</td>
    </tr>

    <tr>
      <td class="category" rowspan="6">积分证明<br>（重中之重）</td>
      <td class="item-name"><div class="checkbox"></div>4. 本科毕业证与学位证</td>
      <td class="points">学历 (+10分)</td>
      <td class="warnings">建议带上「学信网中英双语认证」。</td>
    </tr>
    <tr>
      <td class="item-name"><div class="checkbox"></div>5. 10年上的退/在职证明</td>
      <td class="points">职历 (+20分)</td>
      <td class="warnings">
        <div class="danger-box">
          <b>🔴 极易翻车点，必须具备：</b>
          <ul>
            <li>真实雇主公司实体公章。</li>
            <li>明确工作起止年月。</li>
            <li>明确核心业务内容（具相关性）。</li>
            <li>中文需附加日文翻译件。</li>
          </ul>
        </div>
      </td>
    </tr>
    <tr>
      <td class="item-name"><div class="checkbox"></div>6. 合同与收入证明</td>
      <td class="points">年收 (+20分)</td>
      <td class="warnings">
        <div class="danger-box">
          <b>🔴 计分红线：</b>
          <ul>
            <li>基薪+固定奖金 <b>≥ 600万日元</b>。</li>
            <li>加班/交通/房补等绝对禁止算入！</li>
          </ul>
        </div>
      </td>
    </tr>
    <tr>
      <td class="item-name"><div class="checkbox"></div>7. 身份证明档复印件</td>
      <td class="points">年龄 (+5分)</td>
      <td class="warnings">当天年龄测算（即满 35 周岁）。</td>
    </tr>
    <tr>
      <td class="item-name"><div class="checkbox"></div>8. JLPT N2 成绩证书</td>
      <td class="points">日语 (+10分)</td>
      <td class="warnings">原件复印件。</td>
    </tr>
    <tr>
      <td class="item-name"><div class="checkbox"></div>9. 中国颁发的专利证书</td>
      <td class="points">研究 (+15分)</td>
      <td class="warnings">
        <div class="danger-box">
          <b>🔴 核心审核项：</b>
          <ul>
            <li>类型必须是<b>「发明专利」</b>。</li>
            <li>您本人的名字作为发明人出场。</li>
            <li>完整精确的日文翻译件。</li>
          </ul>
        </div>
      </td>
    </tr>

    <tr>
      <td class="category">机构资料</td>
      <td class="item-name"><div class="checkbox"></div>10. 法定用工机构文件</td>
      <td class="points">雇主合规</td>
      <td class="warnings">视公司规模提供对应的材料（四季报或决算书）。</td>
    </tr>
  </tbody>
</table>

<div class="warning-box">
  <b>💡 翻译要求：</b>所有中文原件的翻译件下方请备注：<br>
  <code>翻訳者：您的名字 &nbsp;&nbsp;&nbsp;&nbsp;翻訳日：YYYY年MM月DD日</code><br>自行翻译完全可以被认可。
</div>

<div class="footer">
  ※ 此 CheckList 依据日本出入国在留管理厅规定专项制作。
</div>

</body>
</html>
`;

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0', timeout: 30000 });
  
  const outputPath = path.join(__dirname, '高度人才_80分个人专属申请清单.pdf');
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '15mm', bottom: '15mm', left: '15mm', right: '15mm' }
  });
  
  console.log('✅ Checklist PDF generated:', outputPath);
  await browser.close();
})();
