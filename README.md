# Supabase auth helper for Web extensions (chrome extensions or other)

An opinionated adapter forked from [supabases auth helpers](https://github.com/supabase/auth-helpers)

## How it works

This adapter allows you to share a session between a website and your extension using supabase. 
The Website will be the main way users log in and out. The extension will be able to read and modify the cookie from
that website in order to automatically follow its auth state.

### Quickstart

#### On your website

On your website, make sure your `createSupabaseClient` stores the session in your cookies. 
If you use any of the adapters from [supabases auth helpers](https://github.com/supabase/auth-helpers) this is already the 
case. Otherwise you can extend the `CookieAuthStorageAdapter` from `@supabase/auth-helpers-shared`.

Then configure `onAuthStateChanged` like so:
```
supabaseClient.auth.onAuthStateChange(notifyExtensionOfAuthStateChange({extensionId: YOUR_EXTENSION_ID}))
```
The extension can't tell by itself when the cookie was changed. So we send a message to the extension whenever our auth state changes to make sure it gets logged out / logged in instantly as well.

#### In your extension
Then, in the `service-worker` of your extension you can create create your client like this:
```js
  const supabaseClient = createExtensionServiceWorkerAdapter({
    supabaseUrl: SUPABASE_URL,
    supabaseKey: SUPABASE_ANON_KEY,
    websiteUrl: 'https://www.example.com',
  })
```
The only important thing here is that you include the `websiteUrl` which is the place where your actual login will happen as that is where the adapter will read the cookie from.

In your extension itself I recommend doing all network requests in the service worker and sending the results to whatever content script needs it.

## In depth about why it works and how best to use it

The reason this works is because we have a **single source of truth**.
Supabase JWT's will expire after some time so we need to use our `refresh_token` to get a new one. However a `refresh_token` can only be used once. So when we use it in the extension and then store the response via `chrome.storage` it will invalidate the token on our website, forcing the user to log in again.

Here's some examples of common auth flows:

### Login 
<img width="754" alt="image" src="https://github.com/jescowuester/supabase-auth-helper-webextension/assets/43379421/d09a4052-e8a4-452a-b876-76f6ce729286">

<img width="630" alt="image" src="https://github.com/jescowuester/supabase-auth-helper-webextension/assets/43379421/d261d029-412b-4ba0-87f8-acd828074e86">

### Token refresh
<img width="742" alt="image" src="https://github.com/jescowuester/supabase-auth-helper-webextension/assets/43379421/a6b1035f-8e18-42ed-b9b9-f2d75aafd6ea">

### Logout
<img width="672" alt="image" src="https://github.com/jescowuester/supabase-auth-helper-webextension/assets/43379421/9e1be82a-a9d1-4cb7-8a44-5afac6a8e0be">
