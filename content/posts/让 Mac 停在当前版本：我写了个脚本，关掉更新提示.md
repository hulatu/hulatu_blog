---
title: 让 Mac 停在当前版本：我写了个脚本，关掉更新提示
date: 2026-11-16T08:50:00+08:00
lastmod: 2026-11-16T10:19:51+08:00
slug: pin-macos
summary: 让 mac 发现不了更新，我做了一个脚本。
description: "一个不到 300 行的开源脚本，从多方面屏蔽 macOS 的更新检测。"
categories: ["工具"]
tags: ["Mac", "脚本", "开源", "效率", "更新"]
featured: false
comments: true
draft: true
---

> 前情提示：
>
> 这个脚本会**连安全补丁一起挡掉**。这是原理决定的，不是缺陷。
>
> 如果你只是「暂时不想升级」，它很适合；如果你打算长期停留，请每隔一两个月 `revert` 一次、手动装完安全补丁、再 `install`。
>
> 所有改动都能使用命令还原。

## 更新红点

每次打开「系统设置」、甚至是左上角的 logo，那个红点就一直在，甚至系统还会是不是的弹窗提醒我升级，挺烦的。

我并不反对新系统。只是我这台 M1 Pro 在 macOS 15 上跑得很稳，工具和工作流都已经调顺手了；并且 26、27 新系统槽点一大堆、很多花里胡哨的新设计、且去除了很多过去习惯的好设计。为了几个用不上的特性，把我习惯了的能干活的系统更新到新版本，我觉得没必要。

系统更新，真正烦人的其实是**它一直在提醒你**。

## 清楚代价

这段我必须放在前面，因为它决定你要不要继续往下看。

`pin-macos` 的做法不是「拒绝升级」，而是**让系统根本发现不了更新**。所以它必然带来这些后果：

- 系统不会自动安装安全更新；
- `softwareupdate` 和 App Store 里的「系统更新」都拿不到更新；
- macOS 15 的官方安全支持大概到 2027 年前后，之后停留在这个版本的风险会明显上升。

换句话说，它把「不被骚扰」和「及时打补丁」变成了二选一。

我接受这个交换，因为我会自己记得定期 `revert` 一次去补丁。**如果你不确定自己会不会记得，那就别装。** 脚本作者不承担系统不安全带来的后果，这句话我写在了 README 最上面。

## 别的办法不行

动手之前我先试了三个流传很广的方法，全都不行。

**一、`sudo softwareupdate --ignore "macOS ..."`**

Apple 已经把这个参数删了。macOS 15 上直接报 `unrecognized option '--ignore'`。

**二、装 `forceDelayedMajorSoftwareUpdates` 描述文件**

这个限制键**只在受监管（supervised）+ MDM 下发的设备上生效**。普通零售机手动安装的描述文件会被直接忽略。我装上之后实测 `softwareupdate --list`，下一个大版本照样列得出来。

**三、只关掉「自动更新」开关**

关掉之后，后台仍然会定期检查，检查到就弹通知。那个开关关的是「自动安装」，不是「自动发现」。

三件事指向同一个结论：**只要系统还能连上 Apple 的更新服务器，它就会告诉你「有新版本」。**

那就只剩一条路——让它连不上。

## 我做了什么

四层屏蔽：

| 层 | 做法 | 效果 |
|---|---|---|
| 偏好设置 | 6 个自动更新开关置 `false` | 停掉后台定期检查 |
| 通知 | 禁用通知代理，提醒日期推到 2099 | 不再弹窗 |
| 网络 | 10 个更新域名指向 `0.0.0.0` | 查也连不上 |
| 角标 | 清掉 Dock 红点 | 视觉安静 |

前两层是「不想让它查」，第三层是「查了也白查」。真正兜底的是第三层——前两层会被系统在某些时机重写回去，`/etc/hosts` 一般不会。

具体改动落在这几个地方：

- `/Library/Preferences/com.apple.SoftwareUpdate.plist` —— 6 个开关置 `false`
- `/Library/Preferences/com.apple.commerce.plist` —— `AutoUpdate` 置 `false`
- `~/Library/Preferences/com.apple.SoftwareUpdate.plist` —— 两个通知日期推到 2099-12-31
- `/etc/hosts` —— 追加一段带标记的屏蔽
- launchd（`gui/<uid>`）—— 禁用通知管理器任务

`/etc/hosts` 里写入的段落是带标记的，一眼能看出来该删哪几行：

```
# === pin-macos BEGIN ===
# 由 pin-macos 添加：阻止 macOS 更新检测。删除本段即可恢复。
0.0.0.0 swscan.apple.com
...
# === pin-macos END ===
```

## 怎么用

```bash
git clone https://github.com/hulatu/Pin-MacOS.git
cd Pin-MacOS
chmod +x pin-macos.sh

sudo ./pin-macos.sh install     # 应用
./pin-macos.sh status           # 看状态（不需要 root）
sudo ./pin-macos.sh verify      # 实际扫一次，确认拿不到更新
```

`install` 是幂等的，重复执行不会把备份覆盖成「已修改」的版本。

`verify` 会真的调一次 `softwareupdate --list`，等十几秒到一分钟。它有两种「成功」：一种是扫不到任何更新，另一种是扫描直接失败、服务器不可达——后者其实更彻底。

### 还原

```bash
sudo ./pin-macos.sh revert
```

hosts、系统级和用户级偏好设置、launchd 任务，全部回到安装前。备份留在 `/Library/Application Support/pin-macos/`，确认没问题了自己删。

## 用代理的注意

这一节是踩出来的。

**如果你用 Clash / Surge / Shadowrocket，并且开了 TUN 或 fake-ip 模式，`/etc/hosts` 会被绕过。** 这些软件有独立的 DNS 解析链，根本不读系统 hosts。表现就是：`status` 显示一切正常，`verify` 却还能扫出更新。

解决办法是把这 10 个域名在代理层拦掉。Clash Verge Rev 用户可以直接用仓库里的 `extras/clash-verge.sh`，它会给所有「规则增强」文件注入 REJECT 规则：

```bash
chmod +x extras/clash-verge.sh
./extras/clash-verge.sh install
./extras/clash-verge.sh revert
```

其他软件就手动把这 10 条加到规则最前面，或者把它们设成直连——设直连时系统 hosts 就会生效了。

## 一个反直觉的坑

`status` 里「自动检查更新」偶尔显示「未设置」，这不是脚本没生效。

macOS 每次执行 `softwareupdate --list`（或后台扫描）之后，会重写 plist，并**把 `AutomaticCheckEnabled` 这个键删掉**。这是系统自己的行为。真正兜底的是 `/etc/hosts`，而且 `verify` 在扫描完之后会自动把偏好补写回去。

写脚本的时候被这个坑掉了一轮排查，所以专门记在这里。

## 已验证的环境

macOS 15.8.3 (24H241)，MacBook Pro M1 Pro，`install → status → verify → revert` 全流程走通。

预期适用于 macOS 13 / 14 / 15。macOS 26 及以后没测——这个项目的目的本来就是不升到那里去。

不需要关 SIP，不会让设备变成「受监管」，不安装任何描述文件。这一点我特意保住了，因为前面两个方案失效的根本原因，就是它们都依赖「受监管」这个前提。

## 什么时候该关掉它

- **想装安全更新**：`revert` → 在「系统设置 → 通用 → 软件更新」里装 → 再 `install`。
- **重装系统或大版本升级之后**：偏好设置和 launchd 状态会被重置，`/etc/hosts` 一般还在，建议重新 `install` 一次。
- **不再需要**：`revert`，然后删掉 `/Library/Application Support/pin-macos/`。

---

代码在 [github.com/hulatu/Pin-MacOS](https://github.com/hulatu/Pin-MacOS)，MIT 协议，不到 300 行。

除了 `verify` 会调用系统的 `softwareupdate --list`，脚本没有任何网络请求；它做的事就是上面那张表里的四层，没有别的。

如果你也在某个版本上待得挺舒服，只是被那个红点烦到，希望它有用。
