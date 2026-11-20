/**
 * Retrieves the browser name and version from the user agent string or navigator.userAgentData.
 * @returns An object containing the browser name and version
 */
/**
 * Retrieves the device type and versions of the browser and operating system.
 * @returns An object containing the device type and versions of the browser and operating system.
 */
export declare function getDeviceTypeAndVersions(): Promise<{
    deviceType: string;
    versions: Record<string, string>;
}>;
