import * as _supabase_supabase_js from '@supabase/supabase-js';
import { SupabaseClientOptions, GoTrueClientOptions, Session } from '@supabase/supabase-js';
import { CookieSerializeOptions } from 'cookie';
export { parse as parseCookies, serialize as serializeCookie } from 'cookie';
import { GenericSchema } from '@supabase/supabase-js/dist/module/lib/types';

declare type CookieOptions = Pick<
	CookieSerializeOptions,
	'domain' | 'secure' | 'path' | 'sameSite' | 'maxAge'
>;
declare type CookieOptionsWithName = {
	name?: string;
} & CookieOptions;
declare type SupabaseClientOptionsWithoutAuth<SchemaName = 'public'> = Omit<
	SupabaseClientOptions<SchemaName>,
	'auth'
>;

interface StorageAdapter extends Exclude<GoTrueClientOptions['storage'], undefined> {}
declare abstract class CookieAuthStorageAdapter implements StorageAdapter {
	protected readonly cookieOptions: CookieOptions;
	constructor(cookieOptions?: CookieOptions);
	protected abstract getCookie(
		name: string
	): string | undefined | null | Promise<string | undefined | null>;
	protected abstract setCookie(name: string, value: string): void;
	protected abstract deleteCookie(name: string): void;
	getItem(key: string): Promise<string | null>;
	setItem(key: string, value: string): void | Promise<void>;
	removeItem(key: string): void | Promise<void>;
}

declare class BrowserCookieAuthStorageAdapter extends CookieAuthStorageAdapter {
	constructor(cookieOptions?: CookieOptions);
	protected getCookie(name: string): string | null;
	protected setCookie(name: string, value: string): null | undefined;
	protected deleteCookie(name: string): null | undefined;
}

declare function createSupabaseClient<
	Database = any,
	SchemaName extends string & keyof Database = 'public' extends keyof Database
		? 'public'
		: string & keyof Database,
	Schema extends GenericSchema = Database[SchemaName] extends GenericSchema
		? Database[SchemaName]
		: any
>(
	supabaseUrl: string,
	supabaseKey: string,
	options: SupabaseClientOptionsWithoutAuth<SchemaName> & {
		auth: {
			storage: StorageAdapter;
			storageKey?: string;
		};
	}
): _supabase_supabase_js.SupabaseClient<Database, SchemaName, Schema>;

declare function parseSupabaseCookie(str: string | null | undefined): Partial<Session> | null;
declare function stringifySupabaseSession(session: Session): string;

declare function isBrowser(): boolean;

declare const DEFAULT_COOKIE_OPTIONS: CookieOptions;

export {
	BrowserCookieAuthStorageAdapter,
	CookieAuthStorageAdapter,
	CookieOptions,
	CookieOptionsWithName,
	DEFAULT_COOKIE_OPTIONS,
	StorageAdapter,
	SupabaseClientOptionsWithoutAuth,
	createSupabaseClient,
	isBrowser,
	parseSupabaseCookie,
	stringifySupabaseSession
};
