const localModuleUrl = localStorage.getItem('localDatexModuleUrl');

export async function loadDatexCoreModule<T>(url: string): Promise<T> {
  let mod: T;

  if (localModuleUrl) {
      try {
          mod = (await import(/* @vite-ignore */ localModuleUrl + url)) as T;
          localStorage.removeItem('localDatexModuleUrlFailed');
      } catch (error) {
          console.error(`Failed to load local module from ${localModuleUrl}:`, error);
          localStorage.setItem('localDatexModuleUrlFailed', 'true');
          mod = await import('@unyt/datex' + url) as T;
      }
  } else {
      mod = await import('@unyt/datex' + url) as T;
  }
  return mod as unknown as T;
}
