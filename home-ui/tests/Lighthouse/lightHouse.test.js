module.exports = {
    audit: (link) => {
        const lighthouse = require("lighthouse");
        const chromeLauncher = require("chrome-launcher");

        jest.setTimeout(120000);
        const launchChromeAndRunLighthouse = (
            url,
            opts = { chromeFlags: ['--headless'] },
            config = null
        ) =>
            chromeLauncher.launch({ chromeFlags: opts.chromeFlags }).then(chrome => {
                opts.port = chrome.port
                return lighthouse(url, opts, config).then(results =>
                    chrome.kill().then(() => results)
                )
            });
        var results;
        beforeAll(async () => {
            results = await launchChromeAndRunLighthouse(`http://localhost:1444/${link}`).then(({ audits }) => audits);
        })
        test('Meaningful first paint score', () => {
            expect(results['first-meaningful-paint'].score).toBeGreaterThanOrEqual(85)
        })
        test('First Interactive score', () => {
            expect(results['first-interactive'].score).toBeGreaterThanOrEqual(85)
        })
        test('Consistently interactive score', () => {
            expect(results['consistently-interactive'].score).toBeGreaterThanOrEqual(85)
        });
        test('Speed index Metric score', () => {
            expect(results['speed-index-metric'].score).toBeGreaterThanOrEqual(85);
        });
        test('Estimated input latency', () => {
            expect(results['estimated-input-latency'].score).toBeGreaterThanOrEqual(85);
        });
        test('Service worker', () => {
            expect(results['service-worker'].score).toBe(true);
        })
        test('Works Offline', () => {
            expect(results['works-offline'].score).toBe(false);
        })
        test('Without JavaScript', () => {
            expect(results['without-javascript'].score).toBe(true);
        })
        test('Load Fast Enough for PWA', () => {
            expect(results['load-fast-enough-for-pwa'].score).toBe(false);
        })
        test('Web App Install Banner', () => {
            expect(results['webapp-install-banner'].score).toBe(false);
        })
        test('Splash Screen', () => {
            expect(results['splash-screen'].score).toBe(false);
        })
        test('Themed Omnibox', () => {
            expect(results['themed-omnibox'].score).toBe(false);
        })
        test('View Port', () => {
            expect(results['viewport'].score).toBe(true);
        })
        test('Content Width', () => {
            expect(results['content-width'].score).toBe(false);
        })
        test('Access Keys', () => {
            expect(results['accesskeys'].score).toBe(false);
        })
        test('Aria Allowed Attribute', () => {
            expect(results['aria-allowed-attr'].score).toBe(false);
        })
        test('Aria Required Attribute', () => {
            expect(results['aria-required-attr'].score).toBe(true);
        })
        test('Aria required children', () => {
            expect(results['aria-required-children'].score).toBe(false);
        })
        test('Aria required Parent', () => {
            expect(results['aria-required-parent'].score).toBe(true);
        })
        test('Aria Roles', () => {
            expect(results['aria-roles'].score).toBe(true);
        })
        test('Aria valid attribute value', () => {
            expect(results['aria-valid-attr-value'].score).toBe(true);
        })
        test('Audio Caption', () => {
            expect(results['audio-caption'].score).toBe(false);
        })
        test('Button Name', () => {
            expect(results['button-name'].score).toBe(true);
        })
        test('Bypass', () => {
            expect(results['bypass'].score).toBe(true);
        })
        test('Color Contrast', () => {
            expect(results['color-contrast'].score).toBe(false);
        })
        test('Definition List', () => {
            expect(results['definition-list'].score).toBe(false);
        })
        test('Dlitem', () => {
            expect(results['dlitem'].score).toBe(false);
        })
        test('Document Title', () => {
            expect(results['document-title'].score).toBe(true);
        })
        test('Duplicate ID', () => {
            expect(results['duplicate-id'].score).toBe(false);
        })
        test('Frame Title', () => {
            expect(results['frame-title'].score).toBe(true);
        })
        test('HTML Has Lang', () => {
            expect(results['html-has-lang'].score).toBe(true);
        })
        test('HTML Lang valid', () => {
            expect(results['html-lang-valid'].score).toBe(true);
        })
        test('Image Alts', () => {
            expect(results['image-alt'].score).toBe(false);
        })
        test('Input Image alt', () => {
            expect(results['input-image-alt'].score).toBe(false);
        })
        test('Label', () => {
            expect(results['label'].score).toBe(false);
        })
        test('Layout Table', () => {
            expect(results['layout-table'].score).toBe(false);
        })
        test('Link Name', () => {
            expect(results['link-name'].score).toBe(false);
        })
        test('List', () => {
            expect(results['list'].score).toBe(true);
        })
        test('Meta Refresh', () => {
            expect(results['meta-refresh'].score).toBe(false);
        })
        test('Meta ViewPort', () => {
            expect(results['meta-viewport'].score).toBe(true);
        })
        test('Object Alt', () => {
            expect(results['object-alt'].score).toBe(false);
        })
        test('Tab Index', () => {
            expect(results['tabindex'].score).toBe(false);
        })
        test('Table Data Headers Attributes', () => {
            expect(results['td-headers-attr'].score).toBe(false);
        })
        test('th has data cells', () => {
            expect(results['th-has-data-cells'].score).toBe(false);
        })
        test('Valid Lang', () => {
            expect(results['valid-lang'].score).toBe(false);
        })
        test('Video Caption', () => {
            expect(results['video-caption'].score).toBe(false);
        })
        test('Video Description', () => {
            expect(results['video-description'].score).toBe(false);
        })
        test('Appcache Manifest', () => {
            expect(results['appcache-manifest'].score).toBe(true);
        })
        test('No WebSQL', () => {
            expect(results['no-websql'].score).toBe(true);
        })
        test('Uses Passive Event Listeners', () => {
            expect(results['uses-passive-event-listeners'].score).toBe(false);
        })
        test('No Mutation Events', () => {
            expect(results['no-mutation-events'].score).toBe(true);
        })
        test('No Document Write', () => {
            expect(results['no-document-write'].score).toBe(true);
        })
        test('External Anchors Use Rel NoOpener', () => {
            expect(results['external-anchors-use-rel-noopener'].score).toBe(false);
        })
        test('Geolocation On Start', () => {
            expect(results['geolocation-on-start'].score).toBe(true);
        })
        test('No Vulnerable Libraries', () => {
            expect(results['no-vulnerable-libraries'].score).toBe(false);
        })
        test('Notification On Start', () => {
            expect(results['notification-on-start'].score).toBe(true);
        })
        test('Deprecations', () => {
            expect(results['deprecations'].score).toBe(true);
        })
        test('Manifest Short Name Length', () => {
            expect(results['manifest-short-name-length'].score).toBe(false);
        })
        test('Errors in Console', () => {
            expect(results['errors-in-console'].score).toBe(false);
        })
        test('Image Aspect Ratio', () => {
            expect(results['image-aspect-ratio'].score).toBe(false);
        })
    },
    links:[
        '',
        // 'quickstart',
        // 'pricing',
        // 'consulting',
        // 'expert',
        // 'about',
        // 'partners',
        // 'joinus',
        // 'contact',
        // 'investors',
        // 'terms',
        // 'privacy',
        // 'service-level-agreement',
        // 'tutorials',
        // 'enterprise/demo',
        // 'enterprise/demo/thank-you',
        // 'enterprise',
        // 'blogFeed'
    ]
}