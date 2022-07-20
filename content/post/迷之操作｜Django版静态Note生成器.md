---
title: 迷之操作｜Django版静态Note生成器
slug: django-staticize
tags: [django,note]
category: Tech
date: 2021-12-26
status: publish
---
## Powered by Django

正如这句话而言，目前这个网站是用Django来搭建的，至于当初为什么要选择Django，可能是因为它作为最流行的Web框架之一，开发迅速，以及自带的admin管理，可以迅速成型一个小型站点，YYDS。



## Why change

最初这个网站是部署在HK的一个VPS上的，配置也是最低配置，解析是套了一层CF，所以造成国内访问非常慢。不过也可以忍受，就没在这上面折腾。按理说这种网站是用来写的，但我好像不务正业的折腾起来了页面，每换一种风格，用不了多久就觉得看着不舒服，于是又重新改了一套页面，于是又重复于此。



前段时间正好赶上各大云厂商双11做活动，于是在结束的最后一天在良心云上薅了一台国内的VPS，配置要比之前的好一点，而且在国内速度跟之前比也是起飞一般的速度。



在迁移项目的时候突然想到，现在的数据都是在当前主机上的，万一哪一天服务器忘记续费的话，等到期的时候数据岂不是就全丢了，要是把数据全上传到Git，这样不就不用担心了，而且切换服务器的时候，直接把项目拉下来直接就能跑，就像Page服务一样，那岂不是妙哉。



## Ready to go

**切换数据库从MySQL到SqlLite**

因为SqlLite数据库是一个本地文件数据库，对于这种小型站点来说，十分便携方便，而且还可以直接上传到Git，所以就把数据全导入到这个数据库里边了。



**全站静态化**

首先统计网站的页面都有哪些，每个页面的路由都是什么，通过这些可以组织静态网页存放的目录结构，而且这些在之后的Nginx配置中也十分重要。



比如我的文章路由为`https://itsso.cool/blog/django-staticize.html`，那么文章 **django-staticize.html**就应该放在静态文件根目录的 **blog**目录下。



由于平时写笔记喜欢在Typora上写完之后，在把文章源码复制到在线的编辑器内，再保存上传发布，同时笔记文件也会同时上传到Github以做备份。但是这样就会存在一个问题，假入想要修改其中某一篇内容的话，重复上面的步骤，实在繁琐，要是把笔记文件连同静态文件在项目部署的时候一起打包发布就好了。



所以就开始改造模型，修改文章内容字段为**FileField**，将笔记文件的相对路径保存到本地数据库内，每次写完就直接把文件上传。



在构建静态文件的时候，数据来源从本地保存的文件来读取，这样一来既可以将笔记备份，同时在修改内容的时候也可以极大的缩减上传步骤。



**给Typora配置专属图片上传服务器**

在写笔记的时候难免会有一些图片，在上传这些图片的时候就会比较麻烦，因为Typora里边文件存放的只是一个当前主机的绝对路径，直接将笔记发布到线上的时候，图片会因为路径的问题加载不出来。此时就需要将图片保存到一个公网可以访问的一个图床内。



好多人的做法是将自己的图片上传到微博、知乎、csdn等一些知名网站上，然后再将这些图片链接插入到自己的笔记内。这样做虽然是很方便快速，但是也会存在一些问题，就比如微博在某一天，突然给自己的链接加上了防盗链，导致了所有的图片在自己以外的网站不能继续使用。



另外的像GitHub/Gitee Page服务，也可以将自己的图片上传到他们的服务器，但是据说会存在不稳定的情况，想了想还是算了。



自己的东西掌握在自己手里才踏实，于是就自己搞了一个专属于自己的图床服务，这次倒是没有选择Django，而且选择了更合适轻量化的Flask。



```python
#!/usr/bin/python
# -*- coding: UTF-8 -*-
import os
import random
import string
from datetime import datetime

from flask import Flask, request
from markupsafe import escape
from werkzeug.utils import secure_filename

from dotenv import load_dotenv

env_path = '.env'
load_dotenv(dotenv_path=env_path)

STATIC_FOLDER = "images"
STATIC_URL = "/img/"

app = Flask(__name__, static_folder=STATIC_FOLDER, static_url_path=STATIC_URL)

app.config['UPLOAD_FOLDER'] = STATIC_FOLDER
basedir = os.path.abspath(os.path.dirname(__file__))
ALLOWED_EXTENSIONS = {'txt', 'png', 'jpg', 'xls', 'JPG', 'PNG', 'xlsx', 'gif', 'GIF'}

HOSTNAME = os.getenv('HOSTNAME')


# 用于判断文件后缀
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS


# 上传文件
@app.route('/api/upload', methods=['POST'], strict_slashes=False)
def api_upload():
    access_token = request.form.get("access_token") or " "
    if access_token != os.getenv("ACCESS_TOKEN"):
        return "error", 403

    time_path = datetime.now().strftime("%Y/%m/")
    file_dir = os.path.join(basedir, app.config['UPLOAD_FOLDER'], time_path)
    if not os.path.exists(file_dir):
        os.makedirs(file_dir)
    f = request.files['file']  # 从表单的file字段获取文件，myfile为该表单的name值
    if f and allowed_file(f.filename):  # 判断是否是允许上传的文件类型
        filename = secure_filename(f.filename)
        ext = filename.rsplit('.', 1)[-1]  # 获取文件后缀
        ran_str = ''.join(random.sample(string.ascii_letters + string.digits, 8))
        new_filename = ran_str + '.' + ext  # 修改了上传的文件名
        f.save(os.path.join(file_dir, new_filename))  # 保存文件到upload目录
        return HOSTNAME + STATIC_URL + time_path + escape(new_filename)
    else:
        return "不支持的文件格式！"


if __name__ == '__main__':
    app.run(debug=True, port=8080)

```

仅需这些代码就可以搭建一个轻量的图片上传服务器，Flask真香～



接下来就是配置Typora，在图片复制进来的时候自动上传到服务器

在Typora→Preferences→Image→Image Uploader选择**Custom Command**，同时在When Insert选择**Upload image**

![kwhpUo4f](https://static.19961002.xyz/img/2022/kwhpUo4f.png)

部署到服务器，接下来我们选择使用脚本来上传，那么就需要一个脚本来对接我们的图片服务器

```bash
#!/bin/bash

# 各类配置信息
base_url="https://img.itsso.cool/api/upload/"
access_token="xxxxxxxxxx"

# 上传图片
for i in "$@"; do
    curl -POST $base_url -H "Content-Type:multipart/form-data" -F "file=@$i" -F "access_token=$access_token"
    echo ""
done
```



点击Test Uploader就可以测试一下我们脚本是否可以正常上传

![swQeFOjS](https://static.19961002.xyz/img/2022/swQeFOjS.png)

现在来看一下效果如何，复制一张图片到Typora。

![LAbunMRk](https://static.19961002.xyz/img/2022/LAbunMRk.gif)



**配置WebHook让远程服务器自动拉取更新代码**

所谓webhook，就是用户可以自定义一种回调函数，通过这种回调函数来改变web应用的行为，这些回调函数可以是web应用的开发者，也可以是第三方用户，并且与原始的web应用没有关联。



这里采用的是Flask搭建一个webhook服务，并通过该服务触发脚本来完成整个流程操作



首先在GitHub上开通webhook，并添加secret，选择settings→webhooks

![gWxHhzsb](https://static.19961002.xyz/img/2022/gWxHhzsb.png)

使用Flask搭建一个简易的webhook服务，其中要注意对请求来源做验证，GitHub官方已经提供了验证方法



> **Note:** For backward-compatibility, we also include the `X-Hub-Signature` header that is generated using the SHA-1 hash function. If possible, we recommend that you use the `X-Hub-Signature-256` header for improved security. The example below demonstrates using the `X-Hub-Signature-256` header.



接下来就是完整的代码：**webhook.py**

```python
import hmac
from flask import Flask, request, jsonify
import subprocess

app = Flask(__name__)
# github中webhooks的secret
github_secret = 'xxxxxxxx'

def encryption(data):
    key = github_secret.encode('utf-8')
    obj = hmac.new(key, msg=data, digestmod='sha256')
    return obj.hexdigest()

@app.route('/hook', methods=['POST'])
def post_data():
    """
    github加密是将post提交的data和WebHooks的secret通过hmac的sha256加密，放到HTTP headers的
    X-Hub-Signature256参数中
    """
    post_data = request.data
    token = encryption(post_data)
    # 认证签名是否有效
    signature = request.headers.get('X-Hub-Signature-256', '').split('=')[-1]
    if signature != token:
        return "token认证无效", 401
    # 运行shell脚本，更新代码
    subprocess.run(["bash", "auto_deploy.sh"])
    return jsonify({"status": 200})

if __name__ == '__main__':
    app.run(port=9000)
```



要触发的脚本文件：**auto_deploy.sh**

```bash
cd "$(dirname "$0")"
echo '--------Git fetch------------'
git fetch
echo '--------Git merge------------'
git merge
echo '-----Already up-to-date------'
echo '----- reload nginx-----'
nginx -s reload
```



接下来将webhook服务部署好，在项目文件夹下push代码的时候，就会触发该hook，在远程服务器自动将更新的代码拉取下来。



到此为止，用了奇奇怪怪的方法实现了自己奇奇怪怪的想法。



其实现在已经有很多很成熟的静态博客生成器，比如Hugo，Jekyll以及Hexo等等，以前搞过一次，后来网站没了，再加上觉得上传方式并不是那么Geek，也有可能是我没找到一些方便的方法，就直接放弃了。



后来重新搭建网站的时候，就打算干脆直接搭建一个动态的网站，至少很多东西要比静态的灵活方便。



至于现在为什么又变成这样了，那可能是



脑子抽风了吧。
