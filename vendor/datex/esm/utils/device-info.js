/**
 * Retrieves the browser name and version from the user agent string or navigator.userAgentData.
 * @returns An object containing the browser name and version
 */
async function getBrowser() {
    // @ts-ignore navigator.userAgentData may not be defined
    if (navigator.userAgentData) {
        // @ts-ignore navigator.userAgentData may not be defined
        const { fullVersionList } = await navigator.userAgentData.getHighEntropyValues(["fullVersionList"]);
        const brand = fullVersionList.find((b) => !/Not.?A.?Brand|Chromium/i.test(b.brand)) ??
            fullVersionList.find((b) => b.brand === "Chromium");
        if (brand)
            return { name: brand.brand, version: brand.version };
    }
    const ua = navigator.userAgent;
    const patterns = [
        ["Edge", /Edg\/([\d.]+)/],
        ["Opera", /OPR\/([\d.]+)/],
        ["Firefox", /Firefox\/([\d.]+)/],
        ["Chrome", /Chrome\/([\d.]+)/],
        ["Safari", /Version\/([\d.]+).*Safari/],
    ];
    for (const [name, re] of patterns) {
        const m = ua.match(re);
        if (m)
            return { name, version: m[1] };
    }
    return { name: "unknown", version: "unknown" };
}
/**
 * Retrieves the device type and versions of the browser and operating system.
 * @returns An object containing the device type and versions of the browser and operating system.
 */
export async function getDeviceTypeAndVersions() {
    const browserInfo = await getBrowser();
    const platformName = navigator.platform || "unknown platform";
    const platformVersion = navigator.userAgent.match(/(Windows NT|Mac OS X|Linux|Android|iOS)[^;)]*/)?.[0] ||
        "unknown";
    return {
        deviceType: `Web Browser (${browserInfo.name} / ${platformName})`,
        versions: {
            "browser": `${browserInfo.name} ${browserInfo.version}`,
            "os": platformVersion,
        },
    };
}
