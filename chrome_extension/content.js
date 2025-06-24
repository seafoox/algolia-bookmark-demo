// LinkedIn Post Saver - Optimized & Safe
class LinkedInPostSaver {
  constructor() {
    this.processedPosts = new WeakSet();
    // 🔧 WEBHOOK URL - Change this URL to your desired endpoint
    this.WEBHOOK_URL = 'https://n8n.srv842775.hstgr.cloud/webhook/8aa91f5a-0935-48d3-bdce-4e1b7ce76634';
    this.STORAGE_KEY = 'linkedin_saved_posts';
    this.init();
  }

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.start());
    } else {
      this.start();
    }
  }

  start() {
    this.addSaveButtons();
    this.setupObserver();
  }

  setupObserver() {
    const observer = new MutationObserver((mutations) => {
      const hasNewPosts = mutations.some(mutation => 
        mutation.type === 'childList' && 
        mutation.addedNodes.length > 0 &&
        Array.from(mutation.addedNodes).some(node => 
          node.nodeType === Node.ELEMENT_NODE && 
          node.querySelector?.('.feed-shared-social-action-bar')
        )
      );
      
      if (hasNewPosts) {
        setTimeout(() => this.addSaveButtons(), 100);
      }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
  }

  addSaveButtons() {
    const actionBars = document.querySelectorAll('.feed-shared-social-action-bar');
    
    actionBars.forEach(actionBar => {
      if (this.processedPosts.has(actionBar)) return;
      
      const sendButton = actionBar.querySelector('button[aria-label*="Send"]');
      if (!sendButton) return;

      const post = this.findPostContainer(actionBar);
      if (!post) return;

      const postId = this.extractPostId(post);
      const isSaved = this.isPostSaved(postId);
      const saveButton = this.createSaveButton(isSaved);
      
      const sendContainer = sendButton.closest('.feed-shared-social-action-bar__action-button');
      if (sendContainer) {
        sendContainer.insertAdjacentElement('afterend', this.createButtonContainer(saveButton));
        this.setupButtonHandler(saveButton, post, postId, isSaved);
        this.processedPosts.add(actionBar);
      }
    });
  }

  findPostContainer(actionBar) {
    // Safe traversal to find post container
    let element = actionBar;
    let attempts = 0;
    
    while (element && attempts < 10) {
      if (element.classList?.contains('feed-shared-update-v2__control-menu-container')) {
        return element.parentElement;
      }
      element = element.parentElement;
      attempts++;
    }
    
    // Fallback: try different selector
    return actionBar.closest('[data-urn]') || 
           actionBar.closest('.feed-shared-update-v2') ||
           actionBar.closest('.update-v2-social-activity')?.parentElement;
  }

  createSaveButton(isSaved = false) {
    const button = document.createElement('button');
    button.className = 'artdeco-button artdeco-button--muted artdeco-button--3 artdeco-button--tertiary social-actions-button linkedin-saver-btn';
    button.setAttribute('data-saved', isSaved.toString());
    button.type = 'button';
    
    const iconPath = isSaved ? this.getRemoveIconPath() : this.getAddIconPath();
    const buttonText = isSaved ? 'Saved' : 'Save';
    
    button.innerHTML = `
      <svg class="artdeco-button__icon" width="16" height="16" viewBox="0 0 91.5 122.88">
        <path fill="currentColor" fill-rule="evenodd" d="${iconPath}"/>
      </svg>
      <span class="artdeco-button__text">
        <span class="social-action-button__text">${buttonText}</span>
      </span>
    `;
    
    return button;
  }

  getAddIconPath() {
    return "M62.42,0A29.08,29.08,0,1,1,33.34,29.08,29.08,29.08,0,0,1,62.42,0ZM3.18,19.65H24.73a38,38,0,0,0-1,6.36H6.35v86.75L37.11,86.12a3.19,3.19,0,0,1,4.18,0l31,26.69V66.68a39.26,39.26,0,0,0,6.35-2.27V119.7a3.17,3.17,0,0,1-5.42,2.24l-34-29.26-34,29.42a3.17,3.17,0,0,1-4.47-.33A3.11,3.11,0,0,1,0,119.7H0V22.83a3.18,3.18,0,0,1,3.18-3.18Zm55-2.79a4.1,4.1,0,0,1,.32-1.64l0-.06a4.33,4.33,0,0,1,3.9-2.59h0a4.23,4.23,0,0,1,1.63.32,4.3,4.3,0,0,1,1.39.93,4.15,4.15,0,0,1,.93,1.38l0,.07a4.23,4.23,0,0,1,.3,1.55v8.6h8.57a4.3,4.3,0,0,1,3,1.26,4.23,4.23,0,0,1,.92,1.38l0,.07a4.4,4.4,0,0,1,.31,1.49v.18a4.37,4.37,0,0,1-.32,1.55,4.45,4.45,0,0,1-.93,1.4,4.39,4.39,0,0,1-1.38.92l-.08,0a4.14,4.14,0,0,1-1.54.3H66.71v8.57a4.35,4.35,0,0,1-1.25,3l-.09.08a4.52,4.52,0,0,1-1.29.85l-.08,0a4.36,4.36,0,0,1-1.54.31h0a4.48,4.48,0,0,1-1.64-.32,4.3,4.3,0,0,1-1.39-.93,4.12,4.12,0,0,1-.92-1.38,4.3,4.3,0,0,1-.34-1.62V34H49.56a4.28,4.28,0,0,1-1.64-.32l-.07,0a4.32,4.32,0,0,1-2.25-2.28l0-.08a4.58,4.58,0,0,1-.3-1.54v0a4.39,4.39,0,0,1,.33-1.63,4.3,4.3,0,0,1,3.93-2.66h8.61V16.86Z";
  }

  getRemoveIconPath() {
    return "M62.42,0A29.08,29.08,0,1,1,33.34,29.08,29.08,29.08,0,0,1,62.42,0ZM3.18,19.65H24.73a38,38,0,0,0-1,6.36H6.35v86.75L37.11,86.12a3.19,3.19,0,0,1,4.18,0l31,26.69V66.68a39.26,39.26,0,0,0,6.35-2.27V119.7a3.17,3.17,0,0,1-5.42,2.24l-34-29.26-34,29.42a3.17,3.17,0,0,1-4.47-.33A3.11,3.11,0,0,1,0,119.7H0V22.83a3.18,3.18,0,0,1,3.18-3.18Zm72.1,5.77a4.3,4.3,0,0,1,3,1.26,4.23,4.23,0,0,1,.92,1.38l0,.07a4.4,4.4,0,0,1,.31,1.49v.18a4.37,4.37,0,0,1-.32,1.55,4.45,4.45,0,0,1-.93,1.4,4.39,4.39,0,0,1-1.38.92l-.08,0a4.14,4.14,0,0,1-1.54.3H49.56a4.28,4.28,0,0,1-1.64-.32l-.07,0a4.32,4.32,0,0,1-2.25-2.28l0-.08a4.58,4.58,0,0,1-.3-1.54v0a4.39,4.39,0,0,1,.33-1.63,4.3,4.3,0,0,1,3.93-2.66Z";
  }

  createButtonContainer(button) {
    const container = document.createElement('div');
    container.className = 'feed-shared-social-action-bar__action-button feed-shared-social-action-bar--new-padding';
    
    const hoverable = document.createElement('span');
    hoverable.className = 'artdeco-hoverable-trigger artdeco-hoverable-trigger--content-placed-top artdeco-hoverable-trigger--is-hoverable';
    hoverable.tabIndex = -1;
    
    hoverable.appendChild(button);
    container.appendChild(hoverable);
    return container;
  }

  setupButtonHandler(button, post, postId, initialSaved) {
    let isSaved = initialSaved;
    
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const textEl = button.querySelector('.social-action-button__text');
      const originalText = textEl.textContent;
      
      // Set loading state
      textEl.textContent = isSaved ? 'Removing...' : 'Saving...';
      button.disabled = true;
      
      try {
        const action = isSaved ? 'remove' : 'save';
        let webhookData;
        
        if (isSaved) {
          // Remove action - only send action and post ID
          webhookData = {
            action: 'remove',
            payload: {
              id: postId
            }
          };
        } else {
          // Save action - send action and full post data
          const postData = this.extractPostData(post);
          webhookData = {
            action: 'save',
            payload: postData
          };
        }
        
        const response = await this.sendWebhook(webhookData);
        
        // Only update state if server confirms success
        if (response[0]?.output?.success && response[0]?.output?.received === action) {
          if (isSaved) {
            this.removeFromStorage(postId);
            this.updateButton(button, false);
            isSaved = false;
            textEl.textContent = 'Removed!';
          } else {
            this.saveToStorage(postId);
            this.updateButton(button, true);
            isSaved = true;
            textEl.textContent = 'Saved!';
          }
          
          // Reset to normal state
          setTimeout(() => {
            textEl.textContent = isSaved ? 'Saved' : 'Save';
            button.disabled = false;
          }, 1000);
        } else {
          throw new Error(`${action} action not confirmed by server`);
        }
        
      } catch (error) {
        console.error('Action failed:', error);
        textEl.textContent = 'Error';
        setTimeout(() => {
          textEl.textContent = originalText;
          button.disabled = false;
        }, 2000);
      }
    });
  }

  extractPostId(post) {
    if (!post) return `linkedin_post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const urnEl = post.querySelector('[data-urn]');
    return urnEl?.getAttribute('data-urn') || 
           `linkedin_post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  extractPostData(post) {
    if (!post) return this.getEmptyPostData();
    
    const postId = this.extractPostId(post);
    const cleanText = this.createTextCleaner();
    
    // Author extraction with safe fallbacks
    const author = this.extractAuthor(post, cleanText);
    const isRepost = this.extractRepostInfo(post);
    const content = this.extractContent(post, cleanText);
    const engagement = this.extractEngagement(post);
    const publishedAt = this.extractPublishedTime(post);
    
    return {
      id: postId,
      type: 'linkedin_post',
      isRepost,
      author,
      repost: isRepost,
      content,
      engagement,
      metadata: {
        publishedAt,
        visibility: 'public',
        platform: 'linkedin',
        extractedAt: Math.floor(Date.now() / 1000)
      }
    };
  }

  createTextCleaner() {
    return (text) => {
      if (!text) return '';
      return text
        .replace(/[ \t\r\f\v]+/g, ' ')
        .replace(/\n+/g, '\n')
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n[ \t]+/g, '\n')
        .trim();
    };
  }

  extractAuthor(post, cleanText) {
    const authorEl = post.querySelector('.update-components-actor__title span span[aria-hidden="true"]') || 
                     post.querySelector('.update-components-actor__title span') ||
                     post.querySelector('.update-components-actor__meta-link');
    
    let authorName = 'Unknown Author';
    if (authorEl) {
      authorName = cleanText(authorEl.textContent);
      authorName = authorName.replace(/\s*•\s*\d+(st|nd|rd|th)\s*$/, '').trim();
    }
    
    const authorLink = post.querySelector('.update-components-actor__meta-link');
    const authorUrl = authorLink?.getAttribute('href');
    const profileUrl = authorUrl ? 
      (authorUrl.startsWith('http') ? authorUrl : `https://www.linkedin.com${authorUrl.replace('/posts', '')}`) : null;
    
    const authorImg = post.querySelector('.update-components-actor__avatar-image');
    const imageUrl = authorImg?.getAttribute('src') || null;
    
    const authorDesc = post.querySelector('.update-components-actor__description');
    const followersMatch = authorDesc?.textContent?.match(/([0-9,]+)\s+followers?/);
    const followers = followersMatch ? parseInt(followersMatch[1].replace(/,/g, '')) : 0;
    
    return {
      name: authorName,
      followers: followers || undefined,
      profileUrl,
      imageUrl,
      isCompany: followers > 0
    };
  }

  extractRepostInfo(post) {
    return !!post.querySelector('.update-components-header__text-view')?.textContent?.includes('reposted');
  }

  extractContent(post, cleanText) {
    const contentEl = post.querySelector('.update-components-text');
    const text = contentEl ? cleanText(contentEl.textContent) : '';
    
    const hashtags = Array.from(post.querySelectorAll('a[href*="hashtag"]'))
      .map(el => {
        const tag = cleanText(el.textContent);
        return tag.startsWith('#') ? tag.substring(1) : tag;
      })
      .filter(tag => tag && tag !== '');
    
    const mentions = Array.from(post.querySelectorAll('a[href*="/in/"]'))
      .map(el => ({
        name: cleanText(el.textContent),
        profileUrl: el.getAttribute('href')
      }))
      .filter(m => m.name && !m.name.includes('#') && m.name !== '' && !m.name.match(/^\d+(st|nd|rd|th)$/));
    
    const externalLinks = Array.from(post.querySelectorAll('a[href^="https://lnkd.in"]'))
      .map(el => ({
        displayUrl: cleanText(el.textContent),
        url: el.getAttribute('href')
      }))
      .filter(link => link.displayUrl && link.url);
    
    const imgEl = post.querySelector('.update-components-image__image');
    const hasImage = !!imgEl;
    const image = imgEl ? {
      url: imgEl.getAttribute('src'),
      width: parseInt(imgEl.getAttribute('width')) || null,
      height: parseInt(imgEl.getAttribute('height')) || null
    } : null;
    
    return { text, hashtags, mentions, externalLinks, hasImage, image };
  }

  extractEngagement(post) {
    const likeEl = post.querySelector('.social-details-social-counts__social-proof-fallback-number');
    const likes = likeEl ? parseInt(likeEl.textContent.trim()) : 0;
    
    const repostEl = post.querySelector('button[aria-label*="reposts"]');
    const reposts = repostEl ? parseInt(repostEl.textContent.match(/(\d+)/)?.[1] || '0') : 0;
    
    return { likes, reposts, comments: 0 };
  }

  extractPublishedTime(post) {
    const timeEl = post.querySelector('.update-components-actor__sub-description');
    if (!timeEl) return Math.floor(Date.now() / 1000);
    
    const timeText = timeEl.textContent.trim();
    const match = timeText.match(/(\d+)([wdhm])/);
    
    if (match) {
      const value = parseInt(match[1]);
      const unit = match[2];
      const multipliers = { m: 60, h: 3600, d: 86400, w: 604800 };
      return Math.floor(Date.now() / 1000) - (value * multipliers[unit]);
    }
    
    return Math.floor(Date.now() / 1000);
  }

  getEmptyPostData() {
    return {
      id: `linkedin_post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'linkedin_post',
      isRepost: false,
      author: { name: 'Unknown Author', isCompany: false },
      repost: false,
      content: { text: '', hashtags: [], mentions: [], externalLinks: [], hasImage: false, image: null },
      engagement: { likes: 0, reposts: 0, comments: 0 },
      metadata: {
        publishedAt: Math.floor(Date.now() / 1000),
        visibility: 'public',
        platform: 'linkedin',
        extractedAt: Math.floor(Date.now() / 1000)
      }
    };
  }

  // Storage methods
  getSavedPosts() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
    } catch {
      return {};
    }
  }

  saveToStorage(postId) {
    const saved = this.getSavedPosts();
    saved[postId] = { savedAt: Date.now(), id: postId };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(saved));
  }

  removeFromStorage(postId) {
    const saved = this.getSavedPosts();
    delete saved[postId];
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(saved));
  }

  isPostSaved(postId) {
    return !!this.getSavedPosts()[postId];
  }

  updateButton(button, isSaved) {
    button.setAttribute('data-saved', isSaved.toString());
    const iconPath = isSaved ? this.getRemoveIconPath() : this.getAddIconPath();
    button.querySelector('path').setAttribute('d', iconPath);
    button.querySelector('.social-action-button__text').textContent = isSaved ? 'Saved' : 'Save';
  }

  async sendWebhook(payload) {
    const response = await fetch(this.WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return response.json();
  }
}

// Initialize
if (window.location.hostname === 'www.linkedin.com') {
  new LinkedInPostSaver();
}