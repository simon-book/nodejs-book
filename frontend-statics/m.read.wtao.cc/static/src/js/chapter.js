function setreader(mode) {
    switch (mode) {
        case 'size-s':
            $('#BookText').css('font-size', '14px');
            setCookie('reader-size', 'small');
            $('.content_toolbar .ptm-pull-left button').removeClass('ptm-btn-outlined').addClass('ptm-btn-outlined');
            $('[data-tol^=size-s]').removeClass('ptm-btn-outlined');
            break;
        case 'size-m':
            $('#BookText').css('font-size', '16px');
            setCookie('reader-size', 'middle');
            $('.content_toolbar .ptm-pull-left button').removeClass('ptm-btn-outlined').addClass('ptm-btn-outlined');
            $('[data-tol^=size-m]').removeClass('ptm-btn-outlined');
            break;
        case 'size-l':
            $('#BookText').css('font-size', '20px');
            setCookie('reader-size', 'large');
            $('.content_toolbar .ptm-pull-left button').removeClass('ptm-btn-outlined').addClass('ptm-btn-outlined');
            $('[data-tol^=size-l]').removeClass('ptm-btn-outlined');
            break;
        case 'mode-d':
            $('body').removeAttr('class').addClass('theme-default');
            setCookie('reader-bg', 'default');
            $('.content_toolbar .ptm-pull-right button').removeClass('ptm-btn-outlined').addClass('ptm-btn-outlined');
            $('[data-tol^=mode-d]').removeClass('ptm-btn-outlined');
            break;
        case 'mode-p':
            $('body').removeAttr('class').addClass('theme-green');
            setCookie('reader-bg', 'green');
            $('.content_toolbar .ptm-pull-right button').removeClass('ptm-btn-outlined').addClass('ptm-btn-outlined');
            $('[data-tol^=mode-p]').removeClass('ptm-btn-outlined');
            break;
        case 'mode-n':
            $('body').removeAttr('class').addClass('theme-moon');
            setCookie('reader-bg', 'night');
            $('.content_toolbar .ptm-pull-right button').removeClass('ptm-btn-outlined').addClass('ptm-btn-outlined');
            $('[data-tol^=mode-n]').removeClass('ptm-btn-outlined');
            break;
        default:
            break;
    }
}

function readerset() {
    var readersize = getCookie('reader-size');
    var readerbg = getCookie('reader-bg');
    if (readersize == 'small') {
        $('#BookText').css('font-size', '14px');
        $('[data-tol^=size-s]').removeClass('ptm-btn-outlined');
    } else if (readersize == 'large') {
        $('#BookText').css('font-size', '20px');
        $('[data-tol^=size-l]').removeClass('ptm-btn-outlined');
    } else {
        $('#BookText').css('font-size', '16px');
        $('[data-tol^=size-m]').removeClass('ptm-btn-outlined');
    }
    if (readerbg == 'green') {
        $('body').removeAttr('class').addClass('theme-green');
        $('[data-tol^=mode-p]').removeClass('ptm-btn-outlined');
    } else if (readerbg == 'night') {
        $('body').removeAttr('class').addClass('theme-moon');
        $('[data-tol^=mode-n]').removeClass('ptm-btn-outlined');
    } else {
        $('body').removeAttr('class').addClass('theme-default');
        $('[data-tol^=mode-d]').removeClass('ptm-btn-outlined');
    }
}

function setCookie(name, value) {
    var Days = 30;
    var exp = new Date();
    exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
    document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
}

function getCookie(name) {
    var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
    if (arr = document.cookie.match(reg)) {
        return unescape(arr[2]);
    } else {
        return null;
    }
}

$(function() {
    $('.content_toolbar button').on('click', function() {
        setreader($(this).data('tol'));
    });
    readerset();
})