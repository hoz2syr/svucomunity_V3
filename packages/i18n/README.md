# i18n Package

React i18n package for SVU Community apps. Provides language context, dictionaries, and hooks.

## Install

```bash
npm i @svu-community/i18n
```

## Usage

```tsx
import { I18nProvider, useI18n } from '@svu-community/i18n';

function App() {
  return (
    <I18nProvider defaultLang="ar">
      <YourApp />
    </I18nProvider>
  );
}

function MyComponent() {
  const { t, lang, toggleLang } = useI18n();
  return <button onClick={toggleLang}>{lang === 'ar' ? 'EN' : 'AR'}</button>;
}
```

## Status

- ✅ Arabic (`ar`) dictionary: `schedule/` namespace
- ✅ English (`en`) dictionary: `schedule/` namespace
- ✅ `I18nProvider` + `useI18n` hook
- ⏳ Additional namespace schemas: `admin`, `courses`
