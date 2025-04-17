import { NextResponse } from "next/server"
import { getAllowedDomains } from "@/lib/cookie-service"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const apiKey = searchParams.get("key")
  const domain = searchParams.get("domain")
  const debug = searchParams.get("debug") === "true"

  if (!apiKey || !domain) {
    return NextResponse.json({ error: "Missing API key or domain" }, { status: 400 })
  }

  // Special handling for localhost testing
  const isLocalhost = domain === "localhost" || domain === "127.0.0.1" || domain.includes(".local")

  // Verify if the domain is allowed to use this cookie consent
  const allowedDomains = await getAllowedDomains(apiKey)

  // For localhost, be more permissive with domain verification
  let isDomainAllowed = allowedDomains.includes(domain) || allowedDomains.includes("*")

  // If testing on localhost, also check if any test domains are configured
  if (isLocalhost && !isDomainAllowed) {
    // Check if any test domains are allowed that we can use for localhost
    const testDomain = allowedDomains.find((d) => d !== "*" && !d.includes("localhost"))
    if (testDomain) {
      isDomainAllowed = true
    }
  }

  if (!isDomainAllowed) {
    return NextResponse.json({ error: "Domain not authorized", authorized: false }, { status: 403 })
  }

  // Set CORS headers to allow from any origin for testing
  const headers = new Headers()
  headers.set("Access-Control-Allow-Origin", "*") // Allow from any origin for testing
  headers.set("Access-Control-Allow-Methods", "GET")
  headers.set("Access-Control-Allow-Headers", "Content-Type")
  headers.set("Content-Type", "application/javascript")
  // Add cache control to prevent caching
  headers.set("Cache-Control", "no-store, max-age=0")

  // The actual JavaScript code for the cookie consent functionality
  const jsCode = `
  (function() {
    class CookieConsent {
      constructor(config) {
        this.config = config || {};
        this.container = document.getElementById('cookie-consent-container');
        
        // Debug theme
        if (${debug}) {
          console.log("Cookie consent theme:", this.config.themeId, this.config.theme);
        }
        
        // Ensure categories exists to prevent errors
        if (!this.config.categories) {
          this.config.categories = [];
        }
        
        this.settings = this.loadSettings();
        this.consentGiven = !!localStorage.getItem('cookieConsent');
        
        // Verify domain again
        const currentDomain = window.location.hostname;
        const isLocalhost = currentDomain === 'localhost' || 
                            currentDomain === '127.0.0.1' || 
                            currentDomain.includes('.local');
                            
        // Skip domain verification for localhost
        if (!isLocalhost && currentDomain !== this.config.allowedDomain) {
          console.error("Cookie consent not authorized for this domain");
          return;
        }
        
        if (!this.consentGiven) {
          this.showBanner();
        } else {
          this.loadAcceptedScripts();
          this.addSettingsButton();
        }
      }
      
      loadSettings() {
        const saved = localStorage.getItem('cookieConsent');
        return saved ? JSON.parse(saved) : this.getDefaultSettings();
      }
      
      getDefaultSettings() {
        const settings = {};
        if (this.config.categories && Array.isArray(this.config.categories)) {
          this.config.categories.forEach(category => {
            settings[category.id] = {
              enabled: category.required,
              allowedDomains: category.required ? category.domains : []
            };
          });
        }
        return settings;
      }
      
      showBanner() {
        const banner = document.createElement('div');
        banner.className = 'cookie-consent-banner';
        banner.innerHTML = this.renderBanner();
        this.container.appendChild(banner);
        
        // Add event listeners
        const acceptAllBtn = banner.querySelector('.accept-all-btn');
        const rejectAllBtn = banner.querySelector('.reject-all-btn');
        const customizeBtn = banner.querySelector('.customize-btn');
        
        if (acceptAllBtn) acceptAllBtn.addEventListener('click', () => this.acceptAll());
        if (rejectAllBtn) rejectAllBtn.addEventListener('click', () => this.rejectAll());
        if (customizeBtn) customizeBtn.addEventListener('click', () => this.showPreferences());
      }
      
      renderBanner() {
        // Apply theme directly to the banner
        const theme = this.config.theme || {};
        
        return \`
          <div class="cookie-consent-content">
            <div class="cookie-consent-header">
              <h2 style="color: \${theme.headingColor || '#111111'}">Cookie Consent</h2>
              <p style="color: \${theme.descriptionColor || '#666666'}">\${this.config.companyName || 'Our website'} uses cookies to enhance your browsing experience.</p>
            </div>
            <div class="cookie-consent-body">
              <p style="color: \${theme.textColor || '#333333'}">By clicking "Accept All", you agree to the storing of cookies on your device to enhance site navigation, analyze site usage, and assist in our marketing efforts.</p>
            </div>
            <div class="cookie-consent-footer">
              <button class="reject-all-btn" style="background-color: \${theme.rejectButtonColor || '#ffffff'}; color: \${theme.rejectButtonTextColor || '#333333'}; border-color: \${theme.borderColor || '#e2e8f0'};">Reject All</button>
              <button class="customize-btn" style="background-color: \${theme.customizeButtonColor || '#ffffff'}; color: \${theme.customizeButtonTextColor || '#333333'}; border-color: \${theme.borderColor || '#e2e8f0'};">Customize</button>
              <button class="accept-all-btn" style="background-color: \${theme.acceptButtonColor || '#2563eb'}; color: \${theme.acceptButtonTextColor || '#ffffff'};">Accept All</button>
            </div>
          </div>
        \`;
      }
      
      showPreferences() {
        // Remove the banner if it exists
        const existingBanner = this.container.querySelector('.cookie-consent-banner');
        if (existingBanner) {
          existingBanner.remove();
        }
        
        const preferences = document.createElement('div');
        preferences.className = 'cookie-consent-preferences';
        preferences.innerHTML = this.renderPreferences();
        this.container.appendChild(preferences);
        
        // Add event listeners
        const saveBtn = preferences.querySelector('.save-preferences-btn');
        const rejectBtn = preferences.querySelector('.reject-all-btn');
        
        if (saveBtn) saveBtn.addEventListener('click', () => this.savePreferences());
        if (rejectBtn) rejectBtn.addEventListener('click', () => this.rejectAll());
        
        // Add toggle listeners
        if (this.config.categories && Array.isArray(this.config.categories)) {
          this.config.categories.forEach(category => {
            if (!category.required) {
              const toggle = preferences.querySelector(\`#toggle-\${category.id}\`);
              if (toggle) {
                toggle.checked = this.settings[category.id]?.enabled || false;
                toggle.addEventListener('change', (e) => {
                  if (!this.settings[category.id]) {
                    this.settings[category.id] = { enabled: false, allowedDomains: [] };
                  }
                  this.settings[category.id].enabled = e.target.checked;
                });
              }
            }
          });
        }
      }
      
      renderPreferences() {
        // Apply theme directly to the preferences
        const theme = this.config.theme || {};
        
        const categoriesHtml = this.config.categories && Array.isArray(this.config.categories) 
          ? this.config.categories.map(category => \`
              <div class="cookie-category" style="border-color: \${theme.borderColor || '#e2e8f0'}">
                <div class="cookie-category-header">
                  <div>
                    <h3 style="color: \${theme.headingColor || '#111111'}">\${category.name}</h3>
                    <p style="color: \${theme.descriptionColor || '#666666'}">\${category.description}</p>
                  </div>
                  <label class="toggle">
                    <input type="checkbox" id="toggle-\${category.id}" \${category.required ? 'checked disabled' : ''}>
                    <span class="toggle-slider" style="background-color: \${category.required ? theme.switchActiveColor : '#ccc'}"></span>
                  </label>
                </div>
              </div>
            \`).join('')
          : '';
          
        return \`
          <div class="cookie-consent-content">
            <div class="cookie-consent-header">
              <h2 style="color: \${theme.headingColor || '#111111'}">Cookie Preferences</h2>
              <p style="color: \${theme.descriptionColor || '#666666'}">Manage your cookie preferences below.</p>
            </div>
            <div class="cookie-consent-body">
              \${categoriesHtml}
            </div>
            <div class="cookie-consent-footer">
              <button class="reject-all-btn" style="background-color: \${theme.rejectButtonColor || '#ffffff'}; color: \${theme.rejectButtonTextColor || '#333333'}; border-color: \${theme.borderColor || '#e2e8f0'};">Reject All</button>
              <button class="save-preferences-btn" style="background-color: \${theme.acceptButtonColor || '#2563eb'}; color: \${theme.acceptButtonTextColor || '#ffffff'};">Save Preferences</button>
            </div>
          </div>
        \`;
      }
      
      acceptAll() {
        const allAccepted = {};
        if (this.config.categories && Array.isArray(this.config.categories)) {
          this.config.categories.forEach(category => {
            allAccepted[category.id] = {
              enabled: true,
              allowedDomains: category.domains || []
            };
          });
        }
        
        this.settings = allAccepted;
        this.saveConsent();
      }
      
      rejectAll() {
        const allRejected = {};
        if (this.config.categories && Array.isArray(this.config.categories)) {
          this.config.categories.forEach(category => {
            allRejected[category.id] = {
              enabled: category.required || false,
              allowedDomains: (category.required && category.domains) ? category.domains : []
            };
          });
        }
        
        this.settings = allRejected;
        this.saveConsent();
      }
      
      savePreferences() {
        this.saveConsent();
      }
      
      saveConsent() {
        localStorage.setItem('cookieConsent', JSON.stringify(this.settings));
        this.consentGiven = true;
        
        // Remove the banner or preferences
        this.container.innerHTML = '';
        
        // Load scripts based on consent
        this.loadAcceptedScripts();
        
        // Add settings button
        this.addSettingsButton();
      }
      
      loadAcceptedScripts() {
        // Remove any previously loaded scripts
        document.querySelectorAll('script[data-cookie-script]').forEach(script => script.remove());
        
        // Load scripts based on consent
        if (this.config.categories && Array.isArray(this.config.categories)) {
          this.config.categories.forEach(category => {
            const categorySettings = this.settings[category.id];
            
            if (categorySettings?.enabled && category.scripts && Array.isArray(category.scripts)) {
              // Load scripts for this category
              category.scripts.forEach(script => {
                // Check if the script's domain is allowed
                if (script && script.src) {
                  const scriptDomain = this.extractDomain(script.src);
                  if (categorySettings.allowedDomains && 
                      (categorySettings.allowedDomains.includes(scriptDomain) || 
                      categorySettings.allowedDomains.includes('*'))) {
                    this.loadScript(script.src, script.attributes);
                  }
                }
              });
            }
          });
        }
      }
      
      loadScript(src, attributes) {
        if (!src) return;
        
        const script = document.createElement('script');
        script.src = src;
        script.setAttribute('data-cookie-script', 'true');
        
        if (attributes) {
          Object.entries(attributes).forEach(([key, value]) => {
            if (value !== undefined) {
              script.setAttribute(key, value.toString());
            }
          });
        }
        
        document.head.appendChild(script);
      }
      
      extractDomain(url) {
        try {
          const domain = new URL(url).hostname;
          return domain;
        } catch (e) {
          return url;
        }
      }
      
      addSettingsButton() {
        const theme = this.config.theme || {};
        const button = document.createElement('button');
        button.className = 'cookie-settings-btn';
        button.textContent = 'Cookie Settings';
        button.style.backgroundColor = theme.settingsButtonColor || '#ffffff';
        button.style.color = theme.settingsButtonTextColor || '#333333';
        button.style.borderColor = theme.borderColor || '#e2e8f0';
        button.addEventListener('click', () => this.showPreferences());
        this.container.appendChild(button);
      }
    }
    
    // Initialize the cookie consent
    window.CookieConsentInstance = new CookieConsent(window.CookieConsentConfig);
  })();
`

  return new Response(jsCode, {
    headers,
  })
}
