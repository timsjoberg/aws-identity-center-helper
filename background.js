const availableContainerIcons = [
  "fingerprint",
  "briefcase",
  "dollar",
  "cart",
  "circle",
  "gift",
  "vacation",
  "food",
  "fruit",
  "pet",
  "tree",
  "chill",
  "fence"
];

const availableContainerColors = [
  'blue',
  'turquoise',
  'green',
  'yellow',
  'orange',
  'red',
  'pink',
  'purple',
]

function randomIcon() {
  return availableContainerIcons[Math.random() * availableContainerIcons.length | 0]
}

function randomColor() {
  return availableContainerColors[Math.random() * availableContainerColors.length | 0]
}

function extractAccountIdAndRoleName(hash) {
  const urlSearchParams = new URLSearchParams(hash.split('?')[1]);
  const account_id = urlSearchParams.get('account_id');
  const role_name = urlSearchParams.get('role_name');

  return { account_id, role_name };
}

function isConsoleLoginUrl(url) {
  return url.hash.startsWith("#/console?");
}

async function getOrCreateContainer(name) {
  const containers = await browser.contextualIdentities.query({
    name: name,
  });

  if (containers.length >= 1) {
    return containers[0];
  } else {
    return await browser.contextualIdentities.create({
      name: name,
      color: randomColor(),
      icon: randomIcon(),
    });
  }
}

async function containAWSConsoleLogins(request) {
  const url = new URL(request.url);

  if (!isConsoleLoginUrl(url)) {
    return {};
  }

  const accountIdAndRoleName = extractAccountIdAndRoleName(url.hash);

  const containerName = `AICH ${accountIdAndRoleName.account_id} ${accountIdAndRoleName.role_name}`;

  const container = await getOrCreateContainer(containerName);

  const tab = await browser.tabs.get(request.tabId);

  if (container.cookieStoreId != tab.cookieStoreId) {
    try {
      await browser.tabs.create({
        url: request.url,
        cookieStoreId: container.cookieStoreId,
        active: tab.active,
        index: tab.index,
        windowId: tab.windowId,
      });

      await browser.tabs.remove(request.tabId);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  return {};
}

(async function init () {
  browser.webRequest.onBeforeRequest.addListener(containAWSConsoleLogins, {urls: [ "https://*.awsapps.com/start/*"], types: ["main_frame"]}, ["blocking"]);
})();
