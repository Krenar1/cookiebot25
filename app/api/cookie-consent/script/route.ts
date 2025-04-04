import { NextResponse } from "next/server"
import { getAllowedDomains } from "@/lib/cookie-service"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const apiKey = searchParams.get("key")
  const domain = searchParams.get("domain")

  if (!apiKey || !domain) {
    return NextResponse.json({ error: "Missing API key or domain" }, { status: 400 })
  }

  // Verify if the domain is allowed to use this cookie consent
  const allowedDomains = await getAllowedDomains(apiKey)

  // Check if the exact domain is in the allowed list or if there's a wildcard
  const isDomainAllowed = allowedDomains.includes(domain) || allowedDomains.includes("*")

  if (!isDomainAllowed) {
    return NextResponse.json({ error: "Domain not authorized", authorized: false }, { status: 403 })
  }

  // Set CORS headers
  const headers = new Headers()
  headers.set("Access-Control-Allow-Origin", `https://${domain}`)
  headers.set("Access-Control-Allow-Methods", "GET")
  headers.set("Access-Control-Allow-Headers", "Content-Type")
  headers.set("Content-Type", "application/javascript")

  // The actual JavaScript code for the cookie consent functionality
  const jsCode = `
    (function() {
      class CookieConsent {
        constructor(config) {
          this.config = config;
          this.container = document.getElementById('cookie-consent-container');
          this.settings = this.loadSettings();
          this.consentGiven = !!localStorage.getItem('cookieConsent');
          
          // Verify domain again
          const currentDomain = window.location.hostname;
          if (currentDomain !== this.config.allowedDomain) {
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
          this.config.categories.forEach(category => {
            settings[category.id] = {
              enabled: category.required,
              allowedDomains: category.required ? category.domains : []
            };
          });
          return settings;
        }
        
        showBanner() {
          const banner = document.createElement('div');
          banner.className = 'cookie-consent-banner';
          banner.innerHTML = this.renderBanner();
          this.container.appendChild(banner);
          
          // Add event listeners
          banner.querySelector('.accept-all-btn').addEventListener('click', () => this.acceptAll());
          banner.querySelector('.reject-all-btn').addEventListener('click', () => this.rejectAll());
          banner.querySelector('.customize-btn').addEventListener('click', () => this.showPreferences());
        }
        
        renderBanner() {
          return \`
            <div class="cookie-consent-content">
              <div class="cookie-consent-header">
                <h2>Cookie Consent</h2>
                <p>\${this.config.companyName || 'Our website'} uses cookies to enhance your browsing experience.</p>
              </div>
              <div class="cookie-consent-body">
                <p>By clicking "Accept All", you agree to the storing of cookies on your device to enhance site navigation, analyze site usage, and assist in our marketing efforts.</p>
              </div>
              <div class="cookie-consent-footer">
                <button class="reject-all-btn">Reject All</button>
                <button class="customize-btn">Customize</button>
                <button class="accept-all-btn">Accept All</button>
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
          preferences.querySelector('.save-preferences-btn').addEventListener('click', () => this.savePreferences());
          preferences.querySelector('.reject-all-btn').addEventListener('click', () => this.rejectAll());
          
          // Add toggle listeners
          this.config.categories.forEach(category => {
            if (!category.required) {
              const toggle = preferences.querySelector(\`#toggle-\${category.id}\`);
              toggle.checked = this.settings[category.id]?.enabled || false;
              toggle.addEventListener('change', (e) => {
                this.settings[category.id].enabled = e.target.checked;
              });
            }
          });
        }
        
        renderPreferences() {
          return \`
            <div class="cookie-consent-content">
              <div class="cookie-consent-header">
                <h2>Cookie Preferences</h2>
                <p>Manage your cookie preferences below.</p>
              </div>
              <div class="cookie-consent-body">
                \${this.config.categories.map(category => \`
                  <div class="cookie-category">
                    <div class="cookie-category-header">
                      <div>
                        <h3>\${category.name}</h3>
                        <p>\${category.description}</p>
                      </div>
                      <label class="toggle">
                        <input type="checkbox" id="toggle-\${category.id}" \${category.required ? 'checked disabled' : ''}>
                        <span class="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                \`).join('')}
              </div>
              <div class="cookie-consent-footer">
                <button class="reject-all-btn">Reject All</button>
                <button class="save-preferences-btn">Save Preferences</button>
              </div>
            </div>
          \`;
        }
        
        acceptAll() {
          const allAccepted = {};
          this.config.categories.forEach(category => {
            allAccepted[category.id] = {
              enabled: true,
              allowedDomains: category.domains
            };
          });
          
          this.settings = allAccepted;
          this.saveConsent();
        }
        
        rejectAll() {
          const allRejected = {};
          this.config.categories.forEach(category => {
            allRejected[category.id] = {
              enabled: category.required,
              allowedDomains: category.required ? category.domains : []
            };
          });
          
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
          this.config.categories.forEach(category => {
            const categorySettings = this.settings[category.id];
            
            if (categorySettings?.enabled) {
              // Load scripts for this category
              category.scripts.forEach(script => {
                // Check if the script's domain is allowed
                const scriptDomain = this.extractDomain(script.src);
                if (categorySettings.allowedDomains.includes(scriptDomain) || 
                    categorySettings.allowedDomains.includes('*')) {
                  this.loadScript(script.src, script.attributes);
                }
              });
            }
          });
        }
        
        loadScript(src, attributes) {
          const script = document.createElement('script');
          script.src = src;
          script.setAttribute('data-cookie-script', 'true');
          
          if (attributes) {
            Object.entries(attributes).forEach(([key, value]) => {
              script.setAttribute(key, value.toString());
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
          const button = document.createElement('button');
          button.className = 'cookie-settings-btn';
          button.textContent = 'Cookie Settings';
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

