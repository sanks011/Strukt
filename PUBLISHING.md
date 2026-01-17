# Publishing Strukt to VS Code Marketplace

## ✅ What's Already Done
- [x] Icon created (resources/icon.png)
- [x] LICENSE file (MIT)
- [x] CHANGELOG.md
- [x] package.json updated with publisher info
- [x] Extension packaged successfully (strukt-0.1.0.vsix)
- [x] Publisher ID: **sankalpasarkar**

## 📋 Steps to Publish

### 1. Create Azure DevOps Account (Required for PAT)
Go to: https://dev.azure.com
- Sign in with your Microsoft account (create one if needed)
- Create a new organization (any name, free)

### 2. Generate Personal Access Token (PAT)
1. Click your profile icon (top right) → **Personal Access Tokens**
2. Click **+ New Token**
3. Name: `vsce-publisher` (or anything)
4. **CRITICAL SETTINGS**:
   - Organization: **All accessible organizations**
   - Scopes: Click "Show all scopes" → Check **Marketplace (Manage)**
5. Click **Create**
6. **COPY THE TOKEN** - You'll only see it once!

### 3. Create Publisher Account
Go to: https://marketplace.visualstudio.com/manage
- Sign in with same Microsoft account
- Click **Create publisher**
- Publisher ID: **sankalpasarkar** (must match package.json)
- Display Name: **Sankalpa Sarkar**
- Fill in your details (email, LinkedIn, etc.)

### 4. Login with vsce
```bash
vsce login sankalpasarkar
```
When prompted, paste your PAT token

### 5. Publish!
```bash
cd "d:\Coding\My Projects\Strukt"
vsce publish
```

That's it! Your extension will be live in ~5 minutes.

## 🔄 For Updates
```bash
# Update version in package.json, then:
vsce publish patch   # 0.1.0 → 0.1.1
vsce publish minor   # 0.1.0 → 0.2.0
vsce publish major   # 0.1.0 → 1.0.0
```

## 🧪 Test Locally First
```bash
code --install-extension strukt-0.1.0.vsix
```

## 📦 Your Package Location
`D:\Coding\My Projects\Strukt\strukt-0.1.0.vsix`

---

**Publisher Profile Info (already in package.json):**
- Publisher ID: sankalpasarkar
- Email: sankalpasarkar68@outlook.com
- Repository: https://github.com/sanks011/strukt
- LinkedIn: https://www.linkedin.com/in/sankalpacodes
- Twitter: https://twitter.com/sarkar7522
