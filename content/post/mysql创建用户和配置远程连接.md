---
title: MySQL创建用户和配置远程连接
slug: mysql-remote-connection
tags: [MySQL, remote]
category: Tech
date: 2020-12-29
status: publish
---
## 创建远程连接用户

在某些情况下，可能别人需要连接你的数据库进行操作，出于安全考虑，我们需要新建一个用户，让该用户只具有一部分的操作权限操作数据库。

当然如果只有你一个人使用这个数据库的话，也可以跳过这一步，直接选择root用户来操作。

**创建用户**

使用help命令查看如何创建用户

```bash
help create user
```

```bash
Name: 'CREATE USER'
Description:
Syntax:
CREATE USER user_specification
    [, user_specification] ...

user_specification:
    user
    [
        IDENTIFIED BY [PASSWORD] 'password'
      | IDENTIFIED WITH auth_plugin [AS 'auth_string']
    ]

```

根据帮助说明，接下来我们来创建用户

```bash
create user 'zjc'@'localhost' # 创建一个用户zjc，不需要密码即可登录，但只可以在本机登录
create user 'zjc'@'%'	# 创建一个用户zjc，不需要密码即可登录，可以在任意主机登录
create user 'zjc'@'%' identified by '123456'	# 创建一个用户zjc，登录时需要密码123456才可以登录，会自动将密码加密
create user 'zjc'@'%' identified by password '123456' # 创建一个用户zjc，登录时需要密码123456才可以登录，会将密码明文存储
```

**修改密码**

命令：

```bash
set password for 'username'@'host' = PASSWORD('newpassword');
```

查看帮助命令查看详情

```bash
> help set password
Name: 'SET PASSWORD'
Description:
Syntax:
SET PASSWORD [FOR user] =
    {
        PASSWORD('cleartext password')
      | OLD_PASSWORD('cleartext password')
      | 'encrypted password'
    }


```

修改密码：

```bash
set password for 'zjc'@'%' = PASSWORD("654321")
```

**删除用户**

命令：

```bash
drop user username
```

## 用户授权

**查看用户目前的权限**

```bash
> show grants for zjc;
+---------------------------------+
| Grants for zjc@%                |
+---------------------------------+
| GRANT USAGE ON *.* TO `zjc`@`%` |
+---------------------------------+

```

USAGE相当于一个占位符，表示目前zjc用户什么权限都没有，需要我们给他授予权限

**授权该用户权限**

命令：

```bash
grant privileges ON databasename.tablename to 'username'@'host'
```

同样使用help命令详情

```bash
> help grant
Name: 'GRANT'
Description:
Syntax:
GRANT
    priv_type [(column_list)]
      [, priv_type [(column_list)]] ...
    ON [object_type] priv_level
    TO user_specification [, user_specification] ...
    [REQUIRE {NONE | ssl_option [[AND] ssl_option] ...}]
    [WITH with_option ...]

GRANT PROXY ON user_specification
    TO user_specification [, user_specification] ...
    [WITH GRANT OPTION]

object_type:
    TABLE
  | FUNCTION
  | PROCEDURE

priv_level:
    *
  | *.*
  | db_name.*
  | db_name.tbl_name
  | tbl_name
  | db_name.routine_name

user_specification:
    user
    [
        IDENTIFIED BY [PASSWORD] 'password'
      | IDENTIFIED WITH auth_plugin [AS 'auth_string']
    ]

ssl_option:
    SSL
  | X509
  | CIPHER 'cipher'
  | ISSUER 'issuer'
  | SUBJECT 'subject'

with_option:
    GRANT OPTION
  | MAX_QUERIES_PER_HOUR count
  | MAX_UPDATES_PER_HOUR count
  | MAX_CONNECTIONS_PER_HOUR count
  | MAX_USER_CONNECTIONS count

```

- privileges：用户的操作权限，如SELECT，INSERT，UPDATE等，如果要授予所的权限则使用ALL
- databasename：数据库名
- tablename：表名，如果要授予该用户对所有数据库和表的相应操作权限则可用*表示，如*.*

给用户zjc授予权限

```
grant all on *.* to 'zjc'@'%';	
```

刷新权限

```
flush privileges;
```

**取消该用户的权限**

命令：

```bash
revoke privilege ON databasename.tablename FROM 'username'@'host';
```

help查看详情

```bash
> help revoke
Name: 'REVOKE'
Description:
Syntax:
REVOKE
    priv_type [(column_list)]
      [, priv_type [(column_list)]] ...
    ON [object_type] priv_level
    FROM user [, user] ...

REVOKE ALL PRIVILEGES, GRANT OPTION
    FROM user [, user] ...

REVOKE PROXY ON user
    FROM user [, user] ...

```

说明：同上面的授权部分

## 配置远程链接

找到配置文件中的[mysqld]一项

```bash
# this is only for the mysqld standalone daemon
[mysqld]

#
# * Basic Settings
#
user                    = mysql
pid-file                = /run/mysqld/mysqld.pid
socket                  = /run/mysqld/mysqld.sock
#port                   = 3306
basedir                 = /usr
datadir                 = /var/lib/mysql
tmpdir                  = /tmp
lc-messages-dir         = /usr/share/mysql
#skip-external-locking
skip-name-resolve

# Instead of skip-networking the default is now to listen only on
# localhost which is more compatible and is not less secure.
# bind-address            = 127.0.0.1

```

将**bind-address** 注释掉,，然后重启数据库即可

```bash
systemctl restart mysql
```

**问题记录**

我在尝试用 navicat连接的时候，出现（2013，XXXXXXXX）的错误，这样是由于mysql在接收到客户端链接的时候需要对dns进行反向解析，由于我实在局域网内，所有反向解析是不可能成功的。

解决办法有两种：

1. 把client的ip写在mysql服务器的/etc/hosts文件里，随便给个名字就可以了。
2. 在 my.cnf 中加入 **skip-name-resolve** 。

于第一种方法比较笨，也不实用，那么 skip-name-resolve 选项可以禁用dns解析，但是，这样不能在mysql的授权表中使用主机名了，只能使用IP。

什么是mysql的dns反解析

mysql接收到连接请求后，获得的是客户端的ip，为了更好的匹配mysql.user里的权限记录（某些是用hostname定义的）。

如果mysql服务器设置了dns服务器，并且客户端ip在dns上并没有相应的hostname，那么这个过程很慢，导致连接等待。

**官方解释**

> *How MySQL*
> *uses DNS When a new thread connects to mysqld, mysqld will*
> *spawn a new thread to handle the request. This thread will first check*
> *if the hostname is in the hostname cache. If not the thread will call*
> *gethostbyaddr_r() and gethostbyname_r() to resolve the hostname. If*
> *the operating system doesn’t support the above thread-safe calls, the*
> *thread will lock a mutex and call gethostbyaddr() and gethostbyname()*
> *instead. Note that in this case no other thread can resolve other*
> *hostnames that is not in the hostname cache until the first thread is*
> *ready. You can disable DNS host lookup by starting mysqld with*
> *–skip-name-resolve. In this case you can however only use IP names in*
> *the MySQL privilege tables. If you have a very slow DNS and many*
> *hosts, you can get more performance by either disabling DNS lookop*
> *with –skip-name-resolve or by increasing the HOST_CACHE_SIZE define*
> *(default: 128) and recompile mysqld. You can disable the hostname*
> *cache with –skip-host-cache. You can clear the hostname cache with*
> *FLUSH HOSTS or mysqladmin flush-hosts. If you don’t want to allow*
> *connections over TCP/IP, you can do this by starting mysqld with*
> *–skip-networking.*

根据文档说明，如果你的mysql主机查询DNS很慢或是有很多客户端主机时会导致连接很慢，由于我们的开发机器是不能够连接外网的，所以DNS解析是不可能完成的，从而也就明白了为什么连接那么慢了。同时，请注意在增加该配置参数后，mysql的授权表中的host字段就不能够使用域名而只能够使用 ip地址了，因为这是禁止了域名解析的结果。