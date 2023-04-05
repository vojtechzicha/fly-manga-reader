import { RemixBrowser } from '@remix-run/react'
import * as ReactDOMClient from 'react-dom/client'

// Create *and* render a root with hydration.
ReactDOMClient.hydrateRoot(document, <RemixBrowser />)
// Unlike with createRoot, you don't need a separate root.render() call here
