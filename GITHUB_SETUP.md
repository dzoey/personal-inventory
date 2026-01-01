# GitHub Setup Guide

Step-by-step instructions for pushing your Personal Inventory project to GitHub.

## Prerequisites

- Git installed on your computer
- GitHub account created at [github.com](https://github.com)
- Project files in `/home/dzoey/personal-inventory`

## Option 1: Using GitHub CLI (Recommended)

### Step 1: Install GitHub CLI (if not installed)

```bash
# On Ubuntu/Debian
sudo apt install gh

# On macOS
brew install gh

# On Windows
winget install --id GitHub.cli
```

### Step 2: Authenticate with GitHub

```bash
gh auth login
```

Follow the prompts:
1. Choose "GitHub.com"
2. Choose "HTTPS"
3. Authenticate via web browser
4. Complete authentication

### Step 3: Initialize and Push

```bash
cd /home/dzoey/personal-inventory

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Personal Inventory Management System with AI and Barcode support"

# Create GitHub repository and push
gh repo create personal-inventory --public --source=. --remote=origin --push
```

Done! Your repository is now on GitHub.

## Option 2: Using Git Commands (Manual)

### Step 1: Create Repository on GitHub

1. Go to [github.com](https://github.com)
2. Click the "+" icon in top right
3. Select "New repository"
4. Fill in details:
   - **Repository name**: `personal-inventory`
   - **Description**: "AI-powered personal inventory management system with barcode scanning"
   - **Visibility**: Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
5. Click "Create repository"

### Step 2: Initialize Local Repository

```bash
cd /home/dzoey/personal-inventory

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Personal Inventory Management System

- Complete backend with Express and SQLite
- JWT and Google OAuth authentication
- AI integration (Google Cloud Vision + Gemini)
- Barcode scanning and lookup
- Hierarchical locations and containers
- Comprehensive test suite with Jest
- Full API documentation"
```

### Step 3: Connect to GitHub

Replace `YOUR_USERNAME` with your GitHub username:

```bash
# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/personal-inventory.git

# Verify remote
git remote -v

# Push to GitHub
git branch -M main
git push -u origin main
```

## Verify .gitignore

Before pushing, ensure `.gitignore` is properly configured (already done):

```bash
cat .gitignore
```

Should include:
- `node_modules/`
- `.env`
- `*.db`
- `backend/uploads/*` (except .gitkeep)
- Google credentials (`*.json` except package.json)

## Important: Protect Sensitive Data

### Before Pushing, Verify:

```bash
# Check what will be committed
git status

# Make sure these are NOT included:
# - .env files (should be ignored)
# - database.db files
# - Google credentials JSON
# - node_modules/
# - uploaded images (except .gitkeep)
```

### If You Accidentally Committed Secrets:

```bash
# Remove from git but keep locally
git rm --cached backend/.env
git rm --cached backend/google-credentials.json
git rm --cached backend/database.db

# Commit the removal
git commit -m "Remove sensitive files"

# Push
git push
```

## Post-Push Setup

### 1. Add Repository Description

On GitHub repository page:
1. Click "About" settings (gear icon)
2. Add description: "AI-powered personal inventory management system with barcode scanning, Google Cloud Vision, and Gemini AI"
3. Add topics: `inventory-management`, `ai`, `barcode-scanner`, `nodejs`, `express`, `sqlite`, `google-cloud-vision`, `gemini-ai`
4. Save changes

### 2. Add Repository Topics

```
inventory-management
personal-inventory
ai-powered
barcode-scanning
google-cloud-vision
gemini-ai
nodejs
express
sqlite
jwt-authentication
oauth2
```

### 3. Enable GitHub Actions (Optional)

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
      
      - name: Install dependencies
        run: |
          cd backend
          npm install
      
      - name: Run tests
        run: |
          cd backend
          npm test
```

### 4. Add License (Optional)

Create `LICENSE` file with MIT License:

```bash
cat > LICENSE << 'EOF'
MIT License

Copyright (c) 2026 [Your Name]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF

git add LICENSE
git commit -m "Add MIT License"
git push
```

## Making Updates

After initial push, to update your repository:

```bash
# Make changes to your code

# Stage changes
git add .

# Commit with descriptive message
git commit -m "Add new feature: XYZ"

# Push to GitHub
git push
```

## Branching Strategy

### Create Feature Branch

```bash
# Create and switch to new branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Implement new feature"

# Push branch to GitHub
git push -u origin feature/new-feature
```

### Create Pull Request

1. Go to your repository on GitHub
2. Click "Pull requests"
3. Click "New pull request"
4. Select your feature branch
5. Add description
6. Click "Create pull request"

## Useful Git Commands

```bash
# Check status
git status

# View commit history
git log --oneline

# View remote repositories
git remote -v

# Pull latest changes
git pull

# Create new branch
git checkout -b branch-name

# Switch branches
git checkout main

# Delete branch
git branch -d branch-name

# Undo last commit (keep changes)
git reset --soft HEAD~1

# View differences
git diff
```

## Troubleshooting

### Authentication Issues

If you get authentication errors:

```bash
# Use personal access token
# 1. Go to GitHub Settings > Developer settings > Personal access tokens
# 2. Generate new token with 'repo' scope
# 3. Use token as password when prompted
```

### Large Files

If you have large files:

```bash
# Install Git LFS
git lfs install

# Track large files
git lfs track "*.db"
git lfs track "*.jpg"

# Add .gitattributes
git add .gitattributes
git commit -m "Add Git LFS tracking"
```

### Merge Conflicts

```bash
# Pull latest changes
git pull

# Resolve conflicts in files
# Edit files to resolve conflicts

# Stage resolved files
git add .

# Complete merge
git commit -m "Resolve merge conflicts"
```

## Repository Settings

### Recommended Settings

1. **Branch Protection** (Settings > Branches):
   - Require pull request reviews
   - Require status checks to pass
   - Require branches to be up to date

2. **Security** (Settings > Security):
   - Enable Dependabot alerts
   - Enable secret scanning

3. **Actions** (Settings > Actions):
   - Allow all actions
   - Enable workflow permissions

## Sharing Your Project

### Repository URL

Your repository will be available at:
```
https://github.com/YOUR_USERNAME/personal-inventory
```

### Clone URL

Others can clone your repository:
```bash
git clone https://github.com/YOUR_USERNAME/personal-inventory.git
```

### Share on Social Media

Example post:
```
🚀 Just built an AI-powered Personal Inventory Management System!

Features:
✅ Barcode scanning
✅ Google Cloud Vision & Gemini AI
✅ Hierarchical organization
✅ JWT + OAuth authentication
✅ Full test coverage

Check it out: https://github.com/YOUR_USERNAME/personal-inventory

#coding #nodejs #ai #opensource
```

## Next Steps

1. ✅ Push code to GitHub
2. 📝 Add detailed README badges
3. 🎨 Add screenshots/demo
4. 📊 Set up GitHub Actions
5. 🌟 Share with community
6. 🐛 Create issue templates
7. 🤝 Add contributing guidelines

---

**Need Help?**

- [GitHub Docs](https://docs.github.com)
- [Git Documentation](https://git-scm.com/doc)
- [GitHub Community](https://github.community)

**Last Updated**: January 2026