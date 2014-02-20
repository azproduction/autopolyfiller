var autopolyfiller = require('../lib');

function $(sel) {
    return document.querySelector(sel);
}

setTimeout(function () {
    var $code = $('#code'),
        $browsers = $('#browsers'),
        $polyfills = $('#polyfills'),
        $generateButton = $('#generate');

    function generate() {
        console.time('Scan for polyfills');
        try {
            var browsers = ($browsers.value || '').toLowerCase().split(',').map(function (string) {
                return string.trim();
            });

            var polyfills = autopolyfiller(browsers).add($code.value || '').polyfills;

            $polyfills.innerHTML = polyfills
                .map(function (polyfill) {
                    return '<Li>' +
                        '<a href="https://github.com/jonathantneal/polyfill/blob/master/source/' + polyfill + '.js">' +
                            polyfill +
                        '</a>' +
                    '</Li>';
                }).join('');

            console.timeEnd('Scan for polyfills');
        } catch (e) {
            console.timeEnd('Scan for polyfills');
            console.error(e);
        }
    }

    $code.addEventListener('input', generate, false);
    $browsers.addEventListener('input', generate, false);
    $generateButton.addEventListener('click', generate, false);

    generate();
}, 0);
