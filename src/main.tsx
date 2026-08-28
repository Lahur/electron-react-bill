import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {Provider} from 'react-redux'
import * as Sentry from '@sentry/electron/renderer'
import './index.css'
import App from './App.tsx'
import {AppWrapper} from './components/common/PageMeta.tsx'
import {store} from './app/store.ts'

Sentry.init({
  dsn: 'https://3ba4c0f6c910f9af7cb63951262803b0@o4511728439197696.ingest.de.sentry.io/4511987834028112',
  // Uncaught exceptions, unhandled promise rejections and uncaught React
  // render errors are reported automatically by the default integrations.
  // Handled errors are forwarded explicitly: API failures from
  // services/httpClient.ts and rejected thunks from app/sentryMiddleware.ts.
  attachStacktrace: true,
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <AppWrapper>
        <App />
      </AppWrapper>
    </Provider>
  </StrictMode>,
)