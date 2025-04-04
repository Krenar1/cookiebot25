export interface CookieSettings {
  [categoryId: string]: {
    enabled: boolean
    allowedDomains: string[]
  }
}

export interface ScriptConfig {
  src: string
  attributes?: Record<string, string | boolean>
}

export interface CookieCategory {
  id: string
  name: string
  description: string
  required: boolean
  domains: string[]
  scripts: ScriptConfig[]
}

export interface ThemeConfig {
  backgroundColor: string
  textColor: string
  headingColor: string
  descriptionColor: string
  borderColor: string
  borderRadius: string

  acceptButtonColor: string
  acceptButtonTextColor: string
  rejectButtonColor: string
  rejectButtonTextColor: string
  customizeButtonColor: string
  customizeButtonTextColor: string
  settingsButtonColor: string
  settingsButtonTextColor: string

  switchActiveColor: string
}

