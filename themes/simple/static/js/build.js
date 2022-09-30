var SimpleShare = function (e, share_type) {
    function t(e) {
        return e = e.replace("{url}", n), e = e.replace("{title}", r), e = e.replace("{content}", i), e = e.replace("{pic}", s)
    }

    e = e || {};
    var n = e.url || window.location.href, r = e.title || document.title, i = e.content || "", s = e.pic || "";
    n = encodeURIComponent(n), r = encodeURIComponent(r), i = encodeURIComponent(i), s = encodeURIComponent(s);
    var o = "http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url={url}&title={title}&pics={pic}&summary={content}",
        u = "http://service.weibo.com/share/share.php?url={url}&title={title}&pic={pic}&searchPic=false",
        a = "http://share.v.t.qq.com/index.php?c=share&a=index&url={url}&title={title}&appkey=801cf76d3cfc44ada52ec13114e84a96",
        f = "http://widget.renren.com/dialog/share?resourceUrl={url}&srcUrl={url}&title={title}&description={content}",
        l = "http://www.douban.com/share/service?href={url}&name={title}&text={content}&image={pic}",
        c = "https://www.facebook.com/sharer/sharer.php?u={url}&t={title}&pic={pic}",
        h = "https://twitter.com/intent/tweet?text={title}&url={url}",
        p = "https://www.linkedin.com/shareArticle?title={title}&summary={content}&mini=true&url={url}&ro=true";

    var share_hash = {
        'weibo': t(u),
        'twitter': t(h)
    };

    return share_hash[share_type]
    };


    // this.qzone = function () {
    //     window.open(t(o))
    // }, this.weibo = function () {
    //     window.open(t(u))
    // }, this.tqq = function () {
    //     window.open(t(a))
    // }, this.renren = function () {
    //     window.open(t(f))
    // }, this.douban = function () {
    //     window.open(t(l))
    // }, this.facebook = function () {
    //     window.open(t(c))
    // }, this.twitter = function () {
    //     window.open(t(h))
    // }, this.linkedin = function () {
    //     window.open(t(p))
    // }

var WeiBoShare = function (e) {
    var url = SimpleShare(e, 'weibo');
    window.open(url)
};

var TwitterShare = function (e) {
    var url = SimpleShare(e, 'twitter');
    window.open(url)
};
