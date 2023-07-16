import type { AuthChangeEvent, SupabaseClient } from '@supabase/supabase-js';
import * as browser from 'webextension-polyfill';
import type { GenericSchema } from '@supabase/supabase-js/dist/module/lib/types';

/** keep my own build of supabase auth helpers until https://github.com/supabase/auth-helpers/pull/609 is merged */
import {
	CookieAuthStorageAdapter,
	type SupabaseClientOptionsWithoutAuth,
	type CookieOptionsWithName,
	createSupabaseClient
} from './supabase-auth-helpers';

export type WebExtensionConfig = {
	websiteUrl: string;
};

export class WebExtensionAuthStorageAdapter extends CookieAuthStorageAdapter {
	private config: WebExtensionConfig;

	constructor(config: WebExtensionConfig, cookieOptions: CookieOptionsWithName) {
		super(cookieOptions);
		this.config = config;
	}

	protected async getCookie(name: string): Promise<string | null | undefined> {
		const cookies = await browser.cookies.getAll({
			name,
			domain: this.cookieOptions.domain
		});
		if (!cookies[0]) return null;
		return decodeURIComponent(cookies[0].value);
	}
	protected setCookie(name: string, value: string): void {
		browser.cookies.set({
			url: this.config.websiteUrl,
			name,
			value: encodeURIComponent(value)
		});
	}
	protected deleteCookie(name: string): void {
		browser.cookies.remove({
			url: this.config.websiteUrl,
			name
		});
	}
}

export function createExtensionServiceWorkerAdapter<
	Database = any,
	SchemaName extends string & keyof Database = 'public' extends keyof Database
		? 'public'
		: string & keyof Database,
	Schema extends GenericSchema = Database[SchemaName] extends GenericSchema
		? Database[SchemaName]
		: any
>({
	websiteUrl,
	supabaseUrl,
	supabaseKey,
	options,
	cookieOptions
}: {
	/**
	 * The base url of the website where you log in. The source of truth for your auth state.
	 * Must be included in the host_permissions in your manifest.json file.
	 *
	 * @example "https://example.com/"
	 * */
	websiteUrl: string;
	supabaseUrl?: string;
	supabaseKey?: string;
	options?: SupabaseClientOptionsWithoutAuth<SchemaName>;
	cookieOptions?: CookieOptionsWithName;
}): SupabaseClient<Database, SchemaName, Schema> {
	if (!supabaseUrl || !supabaseKey) {
		throw new Error('either supabaseUrl and supabaseKey are required!');
	}

	const supabaseClient = createSupabaseClient<Database, SchemaName, Schema>(
		supabaseUrl,
		supabaseKey,
		{
			...options,
			global: {
				...options?.global,
				headers: {
					...options?.global?.headers
				}
			},
			auth: {
				storageKey: cookieOptions?.name,
				storage: new WebExtensionAuthStorageAdapter({ websiteUrl }, cookieOptions)
			}
		}
	);

	return supabaseClient;
}

export function notifyExtensionOfAuthStateChange({ extensionId }: { extensionId: string }) {
	const notify = (message: any) => browser.runtime.sendMessage(extensionId, message);

	return (event: AuthChangeEvent) => {
		switch (event) {
			case 'SIGNED_IN':
				notify({ type: 'SIGNED_IN' });
				break;
			case 'SIGNED_OUT':
				notify({ type: 'SIGNED_OUT' });
				break;
		}
	};
}
