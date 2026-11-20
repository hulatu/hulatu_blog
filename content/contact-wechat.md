---
title: "微信"
description: "扫码添加胡拉图的微信好友。"
# 2026-11-20：用户要求 QQ 与微信各占一页、每页只放一张二维码。
# `url` 让两个根级内容文件落在 /contact/ 下面，同时不产生 /contact/ 章节页。
# ⚠️ 这个「微信」是**个人微信**，不是 /wechat/ 那个公众号页。
url: "/contact/wechat/"
hideDate: true
hideTitle: true
toc: false
noindex: true
date: 2026-11-20T00:00:00+08:00
draft: false
---

<div class="oa-wrap">
  <img class="oa-qr" src="https://img.hulatu.com/post/qbD1Mk.webp" alt="胡拉图的微信二维码" width="256" height="256" decoding="async">
  <p class="oa-tip">微信扫一扫，或长按识别二维码</p>
  <div class="oa-profile">
    <img class="oa-avatar" src="/images/wechat/avatar.webp" alt="" width="48" height="48" decoding="async">
    <div class="oa-meta">
      <p class="oa-name">胡拉图</p>
      <p class="oa-desc">扫码加我好友</p>
    </div>
  </div>
</div>

<!--
  ── 这一页的来历 ────────────────────────────────────────────────────────
  2026-11-20 新增。此前 /about/「联系我」里的 WeChat 是一条指向
  img.hulatu.com 裸图的链接；当天先做成 /contact/ 同页双码，用户随后要求
  **分开、每页一张**，于是落到 /contact/wechat/（QQ 见 contact-qq.md）。

  视觉与 /wechat/ 公众号页完全同源：`.oa-wrap` / `.oa-qr` / `.oa-tip` /
  `.oa-profile` 全部来自 assets/css/custom.css 第 38 段，这里**零新增样式**。
  ⚠️ /wechat/ 是**公众号**；本页是**个人微信**。两个 URL 只差一层目录，
     改文案或换图时先确认改的是哪一个。
  ⚠️ 页面设置与 /wechat/ 一致：hideTitle / hideDate / toc false / noindex。
  ⚠️ 关于页入口指向本页（不再带 #wechat 锚点）。

  素材仍是图床地址 https://img.hulatu.com/post/qbD1Mk.webp（762×762）。
  `.oa-qr` 固定 256×256 + object-fit: contain。
  要本地化：下载到 static/images/contact/wechat.webp 后改上面的 src 即可。
-->
