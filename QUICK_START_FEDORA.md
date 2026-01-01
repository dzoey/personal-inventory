# Quick Start Guide for Fedora 43

Step-by-step instructions to push your Personal Inventory project to GitHub on Fedora 43.

## Step 1: Install GitHub CLI (Easiest Method)

```bash
# Install GitHub CLI on Fedora
sudo dnf install gh

# Verify installation
gh --version
```

## Step 2: Authenticate with GitHub

```bash
# Login to GitHub
gh auth login
```

Follow the prompts:
1. Select: **GitHub.com**
2. Select: **HTTPS**
3. Select: **Login with a web browser**
4. Copy the one-time code shown
5. Press Enter to open browser
6. Paste the code and authorize

## Step 3: Push to GitHub (One Command!)

```bash
# Navigate to your project
cd /home/dzoey/personal-inventory

# Initialize git, create repo, and push (all in one!)
git init
git add .
git commit -m "Initial commit: Personal Inventory Management System with AI and Barcode support"
gh repo create personal-inventory --public --source=. --remote=origin --push
```

**Done!** Your project is now on GitHub! 🎉

## View Your Repository

```bash
# Open repository in browser
gh repo view --web
```

Or visit: `https://github.com/YOUR_USERNAME/personal-inventory`

## Alternative: Manual Method

If you prefer to create the repository manually:

### 1. Create Repository on GitHub Website

1. Go to https://github.com/new
2. Repository name: `personal-inventory`
3. Description: "AI-powered personal inventory management system"
4. Choose Public or Private
5. **Don't** initialize with README (we already have one)
6. Click "Create repository"

### 2. Push Your Code

```bash
cd /home/dzoey/personal-inventory

# Initialize git
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: Personal Inventory Management System"

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/personal-inventory.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Verify Before Pushing

Check that sensitive files are ignored:

```bash
# View what will be committed
git status

# These should NOT appear:
# - .env files
# - *.db files
# - node_modules/
# - Google credentials JSON files
```

## After Pushing

### Install Dependencies and Test

```bash
cd backend
npm install
npm test
```

### Start the Server

```bash
npm run dev
```

## Making Updates Later

```bash
# Make your changes, then:
git add .
git commit -m "Description of changes"
git push
```

## Useful Commands

```bash
# Check git status
git status

# View commit history
git log --oneline

# View your remote repository
git remote -v

# Open repo in browser
gh repo view --web

# Create a new branch
git checkout -b feature-name

# Switch back to main
git checkout main
```

## Troubleshooting

### If git is not installed:

```bash
sudo dnf install git
```

### If you get authentication errors:

```bash
# Re-authenticate
gh auth login

# Or use personal access token
# 1. Go to GitHub Settings > Developer settings > Personal access tokens
# 2. Generate new token (classic) with 'repo' scope
# 3. Use token as password when prompted
```

### If you need to remove sensitive files:

```bash
# Remove from git but keep locally
git rm --cached backend/.env
git rm --cached backend/database.db

# Commit and push
git commit -m "Remove sensitive files"
git push
```

## Next Steps

1. ✅ Push code to GitHub
2. 📝 Add repository description and topics on GitHub
3. 🌟 Star your own repository
4. 📢 Share with others
5. 🔄 Keep developing and pushing updates

## Quick Reference

```bash
# One-time setup
gh auth login

# Every time you want to push changes
git add .
git commit -m "Your message"
git push

# View on GitHub
gh repo view --web
```

---

**Need Help?**

- GitHub CLI docs: `gh help`
- Git docs: `man git`
- This project's docs: See README.md, SETUP.md, API.md, TESTING.md

**Your project location**: `/home/dzoey/personal-inventory`

**Last Updated**: January 2026