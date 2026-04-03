const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700;900&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Noto Sans SC',sans-serif; color:#1a1a2e; font-size:10px; line-height:1.6; }
  
  /* Cover Page */
  .cover { height:100vh; display:flex; flex-direction:column; justify-content:center; align-items:center; background:linear-gradient(135deg,#0f0c29,#302b63,#24243e); color:#fff; text-align:center; page-break-after:always; }
  .cover h1 { font-size:28px; font-weight:900; margin-bottom:12px; letter-spacing:2px; }
  .cover .subtitle { font-size:14px; color:#a5b4fc; margin-bottom:30px; }
  .cover .meta { font-size:10px; color:#94a3b8; line-height:2; }
  .cover .flag { font-size:60px; margin-bottom:20px; }
  
  /* TOC */
  .toc { page-break-after:always; padding:40px; }
  .toc h2 { font-size:18px; color:#302b63; border-bottom:2px solid #302b63; padding-bottom:8px; margin-bottom:16px; }
  .toc-item { display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px dotted #ddd; font-size:11px; }
  .toc-stage { font-weight:700; color:#302b63; margin-top:12px; font-size:12px; border-bottom:none; }
  
  /* Content */
  .page { padding:30px 40px; }
  h2 { font-size:16px; color:#fff; background:linear-gradient(90deg,#302b63,#24243e); padding:8px 16px; border-radius:6px; margin:20px 0 12px; page-break-after:avoid; }
  h3 { font-size:13px; color:#302b63; border-left:4px solid #6366f1; padding-left:10px; margin:16px 0 8px; page-break-after:avoid; }
  h4 { font-size:11px; color:#475569; margin:12px 0 6px; page-break-after:avoid; }
  
  table { width:100%; border-collapse:collapse; margin:8px 0 12px; font-size:9.5px; }
  th { background:#f1f5f9; color:#334155; font-weight:700; text-align:left; padding:6px 8px; border:1px solid #e2e8f0; }
  td { padding:5px 8px; border:1px solid #e2e8f0; vertical-align:top; }
  tr:nth-child(even) { background:#f8fafc; }
  
  .callout { border-radius:6px; padding:10px 14px; margin:8px 0 12px; font-size:9.5px; page-break-inside:avoid; }
  .callout-title { font-weight:700; margin-bottom:4px; font-size:10px; }
  .c-danger { background:#fef2f2; border-left:4px solid #ef4444; }
  .c-warning { background:#fffbeb; border-left:4px solid #f59e0b; }
  .c-tip { background:#f0fdf4; border-left:4px solid #22c55e; }
  .c-info { background:#eff6ff; border-left:4px solid #3b82f6; }
  .c-important { background:#faf5ff; border-left:4px solid #8b5cf6; }
  
  .risk-high { color:#dc2626; font-weight:700; }
  .risk-mid { color:#d97706; font-weight:700; }
  .risk-low { color:#16a34a; font-weight:700; }
  
  .source { font-size:8.5px; color:#6366f1; margin:4px 0 8px; }
  .timeline-box { background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:12px 16px; font-size:9.5px; white-space:pre-line; line-height:1.8; margin:8px 0; font-family:monospace; }
  
  .footer-note { margin-top:30px; padding:16px; background:#f1f5f9; border-radius:6px; font-size:9px; color:#64748b; text-align:center; }
  
  ol, ul { margin:4px 0 8px 20px; font-size:9.5px; }
  li { margin-bottom:3px; }
  
  @media print {
    .page-break { page-break-before:always; }
  }
</style>
</head>
<body>

<!-- ====== COVER ====== -->
<div class="cover">
  <div class="flag">🇯🇵</div>
  <h1>日本签证路径知识库</h1>
  <div class="subtitle">技術·人文知識·国際業務 → 高度専門職 → 永住者</div>
  <div class="meta">
    📋 资深行政书士视角<br>
    ⚖️ 永住許可ガイドライン（令和8年2月24日改订）<br>
    🏛️ 出入国在留管理厅官方数据<br><br>
    生成日期：2026年4月3日
  </div>
</div>

<!-- ====== TOC ====== -->
<div class="toc">
  <h2>📑 目录</h2>
  <div class="toc-item toc-stage">第一章　技人国签证 & 积分评估</div>
  <div class="toc-item"><span>1.1 签证概要</span></div>
  <div class="toc-item"><span>1.2 雇主分类与材料差异</span></div>
  <div class="toc-item"><span>1.3 续签要点</span></div>
  <div class="toc-item"><span>1.4 高度人才积分自我评估（学历/职历/年收/年龄/研究/特别加分）</span></div>
  <div class="toc-item toc-stage">第二章　转「高度専門職」申请流程</div>
  <div class="toc-item"><span>2.1 法律依据</span></div>
  <div class="toc-item"><span>2.2 申请前确认事项</span></div>
  <div class="toc-item"><span>2.3 必备文件清单</span></div>
  <div class="toc-item"><span>2.4 审查要点 & 2.5 常见拒签原因</span></div>
  <div class="toc-item toc-stage">第三章　高度人才转永住优惠通道</div>
  <div class="toc-item"><span>3.1 制度概述</span></div>
  <div class="toc-item"><span>3.2 两档快速通道 & 追溯计算 & 居住期间</span></div>
  <div class="toc-item"><span>3.3 高度専門職2号</span></div>
  <div class="toc-item toc-stage">第四章　永住申请核心审核标准</div>
  <div class="toc-item"><span>4.1 三大法律要件</span></div>
  <div class="toc-item"><span>4.2 完整文件清单</span></div>
  <div class="toc-item"><span>4.3 常见拒签原因详解</span></div>
  <div class="toc-item toc-stage">附录</div>
  <div class="toc-item"><span>A. J-Skip 特别高度人才制度</span></div>
  <div class="toc-item"><span>B. 核心时间线规划</span></div>
  <div class="toc-item"><span>C. 官方链接汇总 & 咨询窗口</span></div>
</div>

<!-- ====== STAGE 1 ====== -->
<div class="page">
<h2>第一章　技術·人文知識·国際業務 签证维持与积分评估</h2>

<h3>📄 1.1 签证概要</h3>
<table>
  <tr><th>项目</th><th>内容</th></tr>
  <tr><td><b>在留资格</b></td><td>技術・人文知識・国際業務（通称"技人国"）</td></tr>
  <tr><td><b>法律依据</b></td><td>出入国管理及び難民認定法 別表第1の2</td></tr>
  <tr><td><b>活动范围</b></td><td>基于与日本公私机构的合同，从事理学、工学、法律学、经济学等需要专门技术或知识的业务；或基于外国文化的思考/感受性的业务</td></tr>
  <tr><td><b>典型职业</b></td><td>IT工程师、金融分析师、翻译、设计师、市场营销、语言教师</td></tr>
  <tr><td><b>在留期间</b></td><td>5年、3年、1年、3个月</td></tr>
</table>
<div class="source">📎 出处：ISA 技人国签证详情 https://www.moj.go.jp/isa/applications/status/gijinkoku.html</div>

<h3>🏢 1.2 雇主分类与材料差异</h3>
<div class="callout c-important"><div class="callout-title">⚡ 重要</div>技人国签证的申请材料因雇主（所属机关）的分类不同而有显著差异。这一分类在后续转HSP时同样适用。</div>
<table>
  <tr><th>分类</th><th>定义</th><th>材料复杂度</th></tr>
  <tr><td><b>Cat 1</b></td><td>上场企业、国/地方政府机关、独立行政法人等</td><td>最简</td></tr>
  <tr><td><b>Cat 2</b></td><td>前年度源泉徴収税額合计 ≥ 1,000万日元</td><td>较简</td></tr>
  <tr><td><b>Cat 3</b></td><td>提出了法定调书合计表但不符合Cat2标准</td><td>需详细材料</td></tr>
  <tr><td><b>Cat 4</b></td><td>新设企业或不属于上述分类的小型机关</td><td>最复杂</td></tr>
</table>

<h3>🔄 1.3 续签（在留期間更新）要点</h3>
<table>
  <tr><th>项目</th><th>要求</th></tr>
  <tr><td><b>住民税</b></td><td>需提交前年度的课税证明书和纳税证明书</td></tr>
  <tr><td><b>工作连续性</b></td><td>需证明持续从事与在留资格相符的活动</td></tr>
  <tr><td><b>手数料</b></td><td>4,000日元（许可时缴纳收入印纸）</td></tr>
  <tr><td><b>审查期间</b></td><td>2周～1个月</td></tr>
</table>
<div class="callout c-warning"><div class="callout-title">⚠️ 续签常见拒签原因</div>
<ul><li>工作内容与在留资格不符（如实际从事体力劳动而非专业工作）</li><li>长期无业未申报活动变更</li><li>住民税未缴纳或未按时缴纳</li><li>频繁更换雇主且无合理说明</li></ul>
</div>
<div class="source">📎 出处：ISA 在留期間更新手续 https://www.moj.go.jp/isa/applications/procedures/16-3.html</div>

<h3>📊 1.4 高度人才积分自我评估</h3>
<div class="callout c-tip"><div class="callout-title">💡 核心策略</div>您无需等到变更签证才开始评分。在技人国期间就应使用积分计算表进行自我评估。如果已达70分甚至80分，即使不变更为HSP签证，也可在日后永住申请中<b>"追溯"</b>使用。</div>

<h4>三类活动类型</h4>
<table>
  <tr><th>类型</th><th>代码</th><th>活动内容</th><th>适用人群</th></tr>
  <tr><td>高度学术研究</td><td>1号（イ）</td><td>研究、研究指导、教育</td><td>大学/研究机构从业者</td></tr>
  <tr><td>高度专门・技术</td><td>1号（ロ）</td><td>自然科学/人文科学领域专门工作</td><td><b>大多数技人国持有者适用</b></td></tr>
  <tr><td>高度经营・管理</td><td>1号（ハ）</td><td>事业经营/管理</td><td>企业高管/创业者</td></tr>
</table>
<div class="source">📎 出处：ISA 高度人材ポイント制 | ISA 积分评价仕组 | 积分计算表 PDF</div>

<h4>📚 学历加分</h4>
<table>
  <tr><th>条件</th><th>分值</th></tr>
  <tr><td>博士学位</td><td><b>30分</b></td></tr>
  <tr><td>硕士学位（MBA等专门职学位含）</td><td><b>20分</b></td></tr>
  <tr><td>学士学位</td><td><b>10分</b></td></tr>
  <tr><td>拥有多个不同领域的硕/博学位</td><td>额外 <b>+5分</b></td></tr>
</table>

<h4>💼 职业经历（相关实务经验年数 · ロ类）</h4>
<table>
  <tr><th>年数</th><th>分值</th></tr>
  <tr><td>10年以上</td><td><b>20分</b></td></tr>
  <tr><td>7年以上</td><td><b>15分</b></td></tr>
  <tr><td>5年以上</td><td><b>10分</b></td></tr>
  <tr><td>3年以上</td><td><b>5分</b></td></tr>
</table>
<div class="callout c-info"><div class="callout-title">ℹ️ 类别差异</div>上表为<b>ロ类（高度专门・技术）</b>的配点。ハ类（经营管理）的职历配点更高：10年+=25分、7年+=20分、5年+=15分、3年+=10分。</div>

<h4>💰 年收入加分（報酬年額）</h4>
<div class="callout c-important"><div class="callout-title">⚡ 年收入计算规则</div><b>计入</b>：基本工资 + 奖金 + 津贴（职务手当等）<br><b>不计</b>：加班费、通勤交通费、住房补贴<br><b>最低门槛</b>：ロ类/ハ类年收入 <b>必须 ≥ 300万日元</b>，否则不符合资格</div>
<table>
  <tr><th>年收入（万日元）</th><th>～29歳</th><th>30～34歳</th><th>35～39歳</th><th>40歳～</th></tr>
  <tr><td>1,000万以上</td><td><b>40</b></td><td><b>40</b></td><td><b>40</b></td><td><b>40</b></td></tr>
  <tr><td>900万～</td><td><b>35</b></td><td><b>35</b></td><td><b>35</b></td><td><b>35</b></td></tr>
  <tr><td>800万～</td><td><b>30</b></td><td><b>30</b></td><td><b>30</b></td><td><b>30</b></td></tr>
  <tr><td>700万～</td><td><b>25</b></td><td><b>25</b></td><td><b>25</b></td><td>—</td></tr>
  <tr><td>600万～</td><td><b>20</b></td><td><b>20</b></td><td><b>20</b></td><td>—</td></tr>
  <tr><td>500万～</td><td><b>15</b></td><td><b>15</b></td><td><b>15</b></td><td>—</td></tr>
  <tr><td>400万～</td><td><b>10</b></td><td>—</td><td>—</td><td>—</td></tr>
</table>
<div class="callout c-warning"><div class="callout-title">⚠️ 年收入配点的年龄依存性</div>年收入的配点因年龄段不同而异。例如：700万日元对40歳以上为<b>0分</b>，但对39歳以下为<b>25分</b>。400万日元<b>仅对29歳以下</b>给予10分。年收入不足300万（ロ/ハ类）不具备HSP申请资格。</div>

<h4>🎂 年龄加分（イ类/ロ类适用，ハ类无此项）</h4>
<table>
  <tr><th>年龄</th><th>分值</th></tr>
  <tr><td>不满30岁</td><td><b>15分</b></td></tr>
  <tr><td>30～不满35岁</td><td><b>10分</b></td></tr>
  <tr><td>35～不满40岁</td><td><b>5分</b></td></tr>
  <tr><td>40岁以上</td><td><b>0分</b></td></tr>
</table>

<h4>🏆 研究实绩加分（イ/ロ类可用）</h4>
<table>
  <tr><th>条件</th><th>分值</th></tr>
  <tr><td>发明专利（特許）1件以上</td><td><b>15分</b></td></tr>
  <tr><td>在日本政府资助项目中从事研究 3件以上</td><td><b>15分</b></td></tr>
  <tr><td>在学术杂志上发表论文 3篇以上</td><td><b>15分</b></td></tr>
  <tr><td>研究成果被公知机关认定（ORCID等）</td><td><b>15分</b></td></tr>
</table>

<h4>⭐ 特别加分项（ボーナス）</h4>
<table>
  <tr><th>加分项</th><th>分值</th><th>证明材料</th></tr>
  <tr><td>在日本大学取得学位</td><td><b>+10分</b></td><td>毕业证书</td></tr>
  <tr><td>Top Global University对象校毕业</td><td><b>+10分</b></td><td>毕业证书</td></tr>
  <tr><td>世界排名前300大学毕业</td><td><b>+10分</b></td><td>毕业证书 + 排名证据</td></tr>
  <tr><td>JLPT N1 合格</td><td><b>+15分</b></td><td>N1合格证书</td></tr>
  <tr><td>JLPT N2 合格</td><td><b>+10分</b></td><td>N2合格证书</td></tr>
  <tr><td>创新促进认定企业</td><td><b>+10分</b></td><td>企业认定书</td></tr>
  <tr><td>法务大臣认定成长行业</td><td><b>+10分</b></td><td>雇佣合同</td></tr>
  <tr><td>中小企业试验研究费扣除</td><td><b>+5分</b></td><td>确认书</td></tr>
</table>
<div class="source">📎 积分计算表 PDF https://www.moj.go.jp/isa/content/930001655.pdf<br>📎 配点明细表 PDF https://www.moj.go.jp/isa/content/930001658.pdf</div>
</div>

<!-- ====== STAGE 2 ====== -->
<div class="page page-break">
<h2>第二章　从技人国转高度専門職的申请流程</h2>

<h3>⚖️ 2.1 法律依据</h3>
<table>
  <tr><th>项目</th><th>内容</th></tr>
  <tr><td><b>申请类型</b></td><td>在留資格変更許可申請（入管法第20条）</td></tr>
  <tr><td><b>变更对象</b></td><td>技術・人文知識・国際業務 → 高度専門職1号（イ/ロ/ハ）</td></tr>
  <tr><td><b>手数料</b></td><td>4,000日元（收入印纸）</td></tr>
  <tr><td><b>审查期间</b></td><td>ISA公示优先处理约 5个工作日，实际可能因案件复杂度延长至2～4周</td></tr>
  <tr><td><b>管辖</b></td><td>申请人住所地的地方出入国在留管理局</td></tr>
</table>
<div class="source">📎 ISA 在留資格変更手续 | ISA HSP制度总览</div>

<h3>✅ 2.2 申请前确认事项</h3>
<div class="callout c-danger"><div class="callout-title">🚨 不可忽视的前提条件</div>
<ol><li>积分必须达到 <b>70分以上</b></li><li>ロ类/ハ类的年收入必须 <b>≥ 300万日元</b></li><li>必须与日本的公私机关签有有效的雇佣合同</li><li>当前在留资格必须处于有效期内</li><li>不存在"素行不良"记录（刑事犯罪、严重交通违章等）</li></ol>
</div>

<h3>📋 2.3 必备文件清单</h3>
<h4>共通文件（全类型）</h4>
<table>
  <tr><th>#</th><th>文件名</th><th>说明</th></tr>
  <tr><td>1</td><td>在留資格変更許可申請書</td><td>ISA官网下载标准格式</td></tr>
  <tr><td>2</td><td>证件照（4cm × 3cm）</td><td>3个月以内拍摄</td></tr>
  <tr><td>3</td><td>护照及在留卡</td><td>原件提示</td></tr>
  <tr><td>4</td><td><b>ポイント計算表</b></td><td>与活动类型对应的版本</td></tr>
  <tr><td>5</td><td>积分证明材料一式</td><td>学历、JLPT、职历证明等</td></tr>
  <tr><td>6</td><td>雇佣合同书/辞令</td><td>展示劳动条件、年收入</td></tr>
  <tr><td>7</td><td>回信用封筒</td><td>供入管局寄回结果</td></tr>
</table>
<h4>分类追加文件（因雇主类别而异）</h4>
<table>
  <tr><th>分类</th><th>追加文件</th></tr>
  <tr><td><b>Cat 1</b></td><td>四季報复印件或主管部门证明文件</td></tr>
  <tr><td><b>Cat 2</b></td><td>法定调书合计表复印件（总源泉税额≥1,000万）</td></tr>
  <tr><td><b>Cat 3</b></td><td>法定调书合计表 + 登记事项证明书 + 决算书 + 公司介绍</td></tr>
  <tr><td><b>Cat 4</b></td><td>同Cat 3 + 事业计划书 + 追加说明材料</td></tr>
</table>

<h3>🔍 2.4 审查要点</h3>
<table>
  <tr><th>审查重点</th><th>详细说明</th></tr>
  <tr><td><b>积分真实性</b></td><td>逐项核实积分计算表中申报的分数与证明材料是否一致</td></tr>
  <tr><td><b>工作内容匹配</b></td><td>确认HSP类型（イ/ロ/ハ）与实际工作一致</td></tr>
  <tr><td><b>雇佣稳定性</b></td><td>正社员或长期合同优先；派遣需双重证明</td></tr>
  <tr><td><b>素行记录</b></td><td>在留期间是否有违法行为、未申报的工作变更</td></tr>
</table>

<h3>❌ 2.5 常见拒签原因</h3>
<table>
  <tr><th>拒签原因</th><th>风险</th><th>应对策略</th></tr>
  <tr><td>积分计算错误（自评过高）</td><td class="risk-high">🔴 高</td><td>请行政书士进行第三方评估</td></tr>
  <tr><td>年收入不达标（&lt;300万）</td><td class="risk-high">🔴 高</td><td>等年收入满足后再申请</td></tr>
  <tr><td>职业经历证明不足</td><td class="risk-mid">🟡 中</td><td>尽早联络前雇主出具在职证明</td></tr>
  <tr><td>雇佣合同年收入含加班费</td><td class="risk-mid">🟡 中</td><td>让公司出具「年収見込証明書」</td></tr>
  <tr><td>所在企业为Cat 4小微企业</td><td class="risk-mid">🟡 中</td><td>准备详细事业计划书</td></tr>
</table>
</div>

<!-- ====== STAGE 3 ====== -->
<div class="page page-break">
<h2>第三章　高度人才转永住的优惠通道</h2>

<h3>📖 3.1 制度概述</h3>
<table>
  <tr><th>项目</th><th>内容</th></tr>
  <tr><td><b>法律依据</b></td><td>入管法第22条 + 永住許可ガイドライン（令和8年2月24日改订）</td></tr>
  <tr><td><b>制度本质</b></td><td>普通外国人需连续居住10年；高度人才通过积分制大幅缩短</td></tr>
  <tr><td><b>适用情形</b></td><td>HSP持有者，或虽持有其他签证（含技人国）但积分达标者</td></tr>
</table>
<div class="source">📎 ISA 永住許可ガイドライン https://www.moj.go.jp/isa/publications/materials/nyukan_nyukan50.html</div>

<h3>🚀 3.2 两档快速通道</h3>
<table>
  <tr><th>积分门槛</th><th>居住年限</th><th>说明</th></tr>
  <tr><td><b>80分以上</b></td><td>连续居住 <b>1年</b></td><td>最快永住通道（2017年4月26日新设）</td></tr>
  <tr><td><b>70分以上</b></td><td>连续居住 <b>3年</b></td><td>标准HSP优惠通道（2017年4月26日同日施行）</td></tr>
</table>
<div class="callout c-important"><div class="callout-title">⚡ 对比参考</div>普通技人国签证持有者申请永住需连续居住 <b>10年</b>（其中以就劳资格或居住资格持续在留<b>5年以上</b>）。80分高度人才仅需 <b>1年</b>。</div>

<h3>🔄 3.2.2 追溯计算规则（遡り・みなし）</h3>
<div class="callout c-tip"><div class="callout-title">💡 关键发现</div><b>您不必先变更为HSP签证才能使用快速通道！</b></div>
<table>
  <tr><th>场景</th><th>可否使用</th><th>具体要求</th></tr>
  <tr><td>持有HSP签证满1年/3年</td><td>✅ 可以</td><td>直接满足条件</td></tr>
  <tr><td><b>持有技人国，但过去1/3年间达到80/70分</b></td><td><b>✅ 可以</b></td><td>需证明"追溯期间"每年都达标</td></tr>
  <tr><td>最近1年才刚达到80分</td><td>✅ 可以</td><td>证明从1年前到现在持续满足</td></tr>
  <tr><td>曾达70分但中途降至70分以下</td><td>❌ 不可以</td><td>必须<b>连续</b>满足</td></tr>
</table>
<p><b>追溯使用的实操要点：</b></p>
<ol><li>提交永住申请时，同时提交「ポイント計算表」</li><li>提供<b>申请时点</b>的积分证明材料</li><li>同时提供<b>追溯起算点</b>（1年前或3年前）的积分证明</li><li>追溯期间如有工作/收入变更，需提供每个时期的证明</li></ol>

<h3>📅 3.2.3 连续居住期间的计算</h3>
<table>
  <tr><th>规则</th><th>说明</th></tr>
  <tr><td><b>起算日</b></td><td>取得在留许可（技人国或HSP）的日期</td></tr>
  <tr><td><b>出境影响</b></td><td>单次不超90天、年累计不超约150天 → 不影响</td></tr>
  <tr><td><b>长期出境</b></td><td>单次超3个月 → "连续居住"中断，需重新起算</td></tr>
</table>
<div class="callout c-danger"><div class="callout-title">🚨 行政书士提醒</div>即使使用追溯计算，入管局仍会审查追溯期间的<b>全部纳税和社保记录</b>。80分快速通道虽只要求居住1年，但税务和年金记录可能需要提供2年份的数据。</div>

<h3>🔷 3.3 高度専門職2号</h3>
<table>
  <tr><th>项目</th><th>1号</th><th>2号</th></tr>
  <tr><td><b>在留期间</b></td><td>5年（可更新）</td><td><b>无期限</b></td></tr>
  <tr><td><b>活动范围</b></td><td>限于认定类型（イ/ロ/ハ）</td><td>几乎所有就劳活动</td></tr>
  <tr><td><b>变更条件</b></td><td>积分≥70分</td><td>持有1号满<b>3年以上</b> + 持续满足70分</td></tr>
  <tr><td><b>与永住区别</b></td><td>—</td><td>不需更新但仍有活动限制（永住无限制）</td></tr>
</table>
</div>

<!-- ====== STAGE 4 ====== -->
<div class="page page-break">
<h2>第四章　永住申请的核心审核标准</h2>

<h3>⚖️ 4.1 法律上的三大要件</h3>
<p><b>法律依据</b>：入管法第22条第2項 + 永住許可ガイドライン（令和8年2月24日改订）</p>
<div class="source">📎 ISA 永住許可ガイドライン原文 | ISA 永住許可申请手续</div>

<h4>要件一：素行が善良であること（品行良好）</h4>
<table>
  <tr><th>审查内容</th><th>说明</th></tr>
  <tr><td><b>定义</b></td><td>遵守法律，作为社会一员在日常生活中不受非难</td></tr>
  <tr><td><b>刑事记录</b></td><td>无罚金刑或拘禁刑记录</td></tr>
  <tr><td><b>交通违章</b></td><td>频繁轻微违章累积可能影响；酒驾/无证 = 不合格</td></tr>
  <tr><td><b>入管法违反</b></td><td>未经许可从事资格外活动 = 不合格</td></tr>
</table>

<h4>要件二：独立の生計を営むに足りる資産又は技能（经济自立）</h4>
<table>
  <tr><th>审查内容</th><th>说明</th></tr>
  <tr><td><b>年收入基准</b></td><td>单身约 300万日元+；每增1名家属约加 70～80万</td></tr>
  <tr><td><b>审查范围</b></td><td>综合评价家庭（世帯）整体经济状况</td></tr>
  <tr><td><b>HSP申请者</b></td><td>年收入已达70/80分门槛者通常自动满足</td></tr>
</table>

<h4>要件三：国益适合（在留期间 + 公的义务）</h4>
<table>
  <tr><th>标准路径</th><th>HSP快速通道</th></tr>
  <tr><td>连续居住10年以上（其中以就劳/居住资格在留5年以上）</td><td>80分 → 1年 / 70分 → 3年</td></tr>
</table>

<h3>🏛️ 公的義務的履行（最高重要度）</h3>
<div class="callout c-danger"><div class="callout-title">🚨 永住申请被拒的首要原因</div>以下每一项都必须<b>"适正に履行"</b>——不仅要"已缴纳"，还要<b>"按时缴纳"</b>。</div>
<table>
  <tr><th>义务项目</th><th>审查范围</th><th>关键要求</th></tr>
  <tr><td><b>住民税</b></td><td>80分→1年 / 70分→3年 / 标准→5年</td><td>课税+纳税证明书逐年提供</td></tr>
  <tr><td><b>所得税</b></td><td>同上</td><td>納税証明書（その3）</td></tr>
  <tr><td><b>年金</b></td><td>过去 <b>2年</b></td><td>逐月缴纳记录</td></tr>
  <tr><td><b>健康保险</b></td><td>过去 <b>2年</b></td><td>保险证 + 缴纳证明</td></tr>
  <tr><td><b>入管法届出</b></td><td>全在留期间</td><td>转职/离职14天内提交届出</td></tr>
</table>
<div class="callout c-warning"><div class="callout-title">⚠️ "滞纳"的严格定义</div>即使最终已补缴，审查期间内任何一个月"到期日未支付"的记录 → 入管局<b>原则上做否定评价</b>。<ul><li>住民税普通征收（自行缴纳）漏缴后补交</li><li>国民年金的追纳（2年时效内补交仍视为"未按时"）</li><li>切换工作期间的社保空白</li></ul></div>

<h3>📋 4.2 完整文件清单</h3>
<h4>通用文件</h4>
<table>
  <tr><th>#</th><th>文件</th><th>说明</th></tr>
  <tr><td>1</td><td>永住許可申請書</td><td>ISA官网标准格式</td></tr>
  <tr><td>2</td><td>证件照 4×3cm</td><td>3个月以内</td></tr>
  <tr><td>3</td><td><b>理由書</b></td><td>日语撰写：申请理由、在日经历、未来计划</td></tr>
  <tr><td>4</td><td>护照・在留卡</td><td>原件提示</td></tr>
  <tr><td>5</td><td>住民票（世帯全員記載、マイナンバー記載なし）</td><td>3个月以内发行</td></tr>
  <tr><td>6</td><td>在职证明书</td><td>现雇主出具</td></tr>
  <tr><td>7</td><td>收入印纸</td><td><b>10,000日元</b>（2025年4月改定）</td></tr>
</table>
<h4>纳税・社保证明</h4>
<table>
  <tr><th>#</th><th>文件</th><th>年份</th><th>取得</th></tr>
  <tr><td>8</td><td>住民税 課税証明書</td><td>80分→1年 / 70分→3年</td><td>区/市役所</td></tr>
  <tr><td>9</td><td>住民税 納税証明書</td><td>同上</td><td>同上</td></tr>
  <tr><td>10</td><td>国税 納税証明書（その3）</td><td>直近</td><td>税务署</td></tr>
  <tr><td>11</td><td>年金記録（逐月）</td><td>过去2年</td><td>ねんきんネット / 年金事務所</td></tr>
  <tr><td>12</td><td>健保缴纳证明</td><td>过去2年</td><td>区/市役所</td></tr>
</table>
<h4>HSP快速通道追加文件</h4>
<table>
  <tr><th>#</th><th>文件</th><th>说明</th></tr>
  <tr><td>13</td><td>ポイント計算表（申請時点版）</td><td>当前满足70/80分</td></tr>
  <tr><td>14</td><td>ポイント計算表（遡及時点版）</td><td>1/3年前也满足</td></tr>
  <tr><td>15</td><td>各加分项证明材料一式</td><td>学历、JLPT、职历、收入等</td></tr>
</table>
<h4>身元保证</h4>
<table>
  <tr><th>#</th><th>文件</th><th>说明</th></tr>
  <tr><td>16</td><td>身元保証書</td><td>日本人或永住者签署</td></tr>
  <tr><td>17</td><td>保证人住民票</td><td>3个月以内</td></tr>
  <tr><td>18</td><td>保证人在职/课税证明</td><td>证明经济能力</td></tr>
</table>
<div class="callout c-info"><div class="callout-title">ℹ️ 关于身元保证人</div>保证人承担"道义上的保证"而非法律上的连带责任。通常为：日本人配偶、上司/同事、或已取得永住的友人。</div>

<h3>❌ 4.3 常见拒签原因详解</h3>
<table>
  <tr><th>拒签原因</th><th>风险</th><th>说明</th><th>应对策略</th></tr>
  <tr><td><b>税金滞纳</b></td><td class="risk-high">🔴 极高</td><td>1个月迟缴即可能致拒</td><td>切换为特別徴収（公司代扣）</td></tr>
  <tr><td><b>年金漏缴</b></td><td class="risk-high">🔴 极高</td><td>转职空白期最常见</td><td>转职后立即办理切换</td></tr>
  <tr><td><b>健保空白</b></td><td class="risk-high">🔴 高</td><td>离职后未14日内加入国保</td><td>离职后立即到区役所办理</td></tr>
  <tr><td><b>长期离境</b></td><td class="risk-mid">🟡 中高</td><td>单次>90天或年累计>150天</td><td>规划出行不超限</td></tr>
  <tr><td><b>转职未申报</b></td><td class="risk-mid">🟡 中</td><td>14天内未提交届出</td><td>可事后补报</td></tr>
  <tr><td><b>交通违章</b></td><td class="risk-mid">🟡 中</td><td>5次+轻微或1次重大</td><td>附理由书说明</td></tr>
  <tr><td><b>收入不稳定</b></td><td class="risk-mid">🟡 中</td><td>审查期间某年大幅下降</td><td>提供稳定性证明</td></tr>
  <tr><td><b>理由书不足</b></td><td class="risk-low">🟢 低中</td><td>逻辑不通</td><td>请行政书士代书</td></tr>
</table>
</div>

<!-- ====== APPENDIX ====== -->
<div class="page page-break">
<h2>附录</h2>

<h3>🌟 A. J-Skip 特别高度人才制度（2023年4月新设）</h3>
<div class="callout c-info"><div class="callout-title">ℹ️ J-Skip</div>面向特别优秀的高级人才，<b>无需积分计算</b>即可获得HSP待遇。</div>
<h4>J-Skip 1号</h4>
<table>
  <tr><th>活动类型</th><th>条件</th></tr>
  <tr><td>研究 / 技术（イ/ロ）</td><td>硕士+ 且年收入 ≥ <b>2,000万日元</b><br><em>或</em>：10年+相关实务经验 且年收入 ≥ <b>2,000万日元</b></td></tr>
  <tr><td>经营管理（ハ）</td><td>5年+经验 且年收入 ≥ <b>4,000万日元</b></td></tr>
</table>
<h4>J-Skip 2号（直通无期限在留）</h4>
<table>
  <tr><th>活动类型</th><th>条件</th></tr>
  <tr><td>研究 / 技术</td><td>硕士+ 且 ≥2,000万 且在日居住满1年</td></tr>
  <tr><td>经营管理</td><td>5年+经验 且 ≥4,000万 且在日居住满1年</td></tr>
</table>
<div class="callout c-tip"><div class="callout-title">💡 J-Skip 永住优惠</div>J-Skip认定者（特别高度人材）满足条件后<b>居住满1年</b>即可申请永住许可，与80分快速通道相同。</div>

<h3>📅 B. 核心时间线规划（行政书士建议）</h3>
<div class="timeline-box">入境日本（持技人国签证）
  │
  ├─ 立即开始：确保社保、税务全部通过公司代扣（特別徴収）
  ├─ 入境时：进行HSP积分自我评估
  │
  ├─ 6个月后：如积分≥80分，开始准备追溯证明材料
  │
  ├─ 1年后（如80分）：
  │   ├─ 选项A：直接以技人国身份申请永住（追溯计算）
  │   └─ 选项B：先变更为HSP签证，再申请永住（更稳妥）
  │
  ├─ 3年后（如70分）：
  │   ├─ 同选项A/B
  │   └─ 如果条件满足，可同时考虑HSP2号
  │
  └─ 永住取得 🎉</div>

<h3>🔗 C. 官方页面链接汇总</h3>
<table>
  <tr><th>页面</th><th>链接</th></tr>
  <tr><td>ISA 首页</td><td>https://www.moj.go.jp/isa/</td></tr>
  <tr><td>技人国 在留资格</td><td>https://www.moj.go.jp/isa/applications/status/gijinkoku.html</td></tr>
  <tr><td>HSP 积分制度</td><td>https://www.moj.go.jp/isa/publications/materials/newimmiact_3_index.html</td></tr>
  <tr><td>HSP 积分评价</td><td>https://www.moj.go.jp/isa/publications/materials/newimmiact_3_evaluate_index.html</td></tr>
  <tr><td>HSP 优遇措施</td><td>https://www.moj.go.jp/isa/publications/materials/newimmiact_3_preferential_index.html</td></tr>
  <tr><td>HSP Q&A</td><td>https://www.moj.go.jp/isa/applications/resources/newimmiact_3_qa.html</td></tr>
  <tr><td>永住許可ガイドライン</td><td>https://www.moj.go.jp/isa/publications/materials/nyukan_nyukan50.html</td></tr>
  <tr><td>积分计算表 PDF</td><td>https://www.moj.go.jp/isa/content/930001655.pdf</td></tr>
  <tr><td>配点明细表 PDF</td><td>https://www.moj.go.jp/isa/content/930001658.pdf</td></tr>
</table>

<h4>📞 咨询窗口</h4>
<table>
  <tr><th>方式</th><th>号码</th><th>时间</th></tr>
  <tr><td>外国人在留综合信息中心</td><td><b>0570-013904</b></td><td>平日 8:30～17:15</td></tr>
  <tr><td>IP电话/海外</td><td><b>03-5796-7112</b></td><td>同上</td></tr>
  <tr><td>语言支持</td><td colspan="2">日语、英语、中文、韩语、西班牙语等多语言</td></tr>
</table>
<div class="source">📎 ISA 咨询窗口详情 https://www.moj.go.jp/isa/consultation/center/index.html</div>

<div class="footer-note">
  <b>免责声明</b>：本知识库基于日本入管厅官方网站截至2026年4月的公开信息编制。入管政策可能变更，实际申请时请以入管局最新公告为准。<br>
  建议在正式申请前咨询持牌行政书士进行个案评估。
</div>
</div>

</body>
</html>`;

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0', timeout: 30000 });
  
  const outputPath = path.join(__dirname, '日本签证路径知识库_完整版.pdf');
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '10mm', bottom: '15mm', left: '0mm', right: '0mm' },
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: '<div style="width:100%;text-align:center;font-size:8px;color:#94a3b8;font-family:sans-serif;">日本签证路径知识库 | 技人国 → 高度専門職 → 永住 &nbsp;&nbsp; <span class="pageNumber"></span> / <span class="totalPages"></span></div>',
  });
  
  console.log('✅ PDF generated:', outputPath);
  await browser.close();
})();
