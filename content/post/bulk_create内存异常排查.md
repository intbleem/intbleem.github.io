---
title: bulk_create内存异常排查
slug: django-bulk-create
tags: [django,MySQLdb]
category: Tech
date: 2021-12-14
status: publish
---
**背景**

因为需要往项目数据库上传大量数据，数据是以文件的方式存储，所以采用django的**bulk_create**批量读取并上传，但是在上传过程中发现，上传程序占用的内存一直在上升，甚至到最后直接把内存占满了。



**排查问题**

刚开始首先怀疑的就是程序代码有问题导致内存没有释放，自己看没发现什么问题，请教同事帮忙看也没有发现什么问题，所以干脆就硬着头皮去试代码。在每次循环之后都加入`gc.collect()`,尝试主动释放内存，发现问题仍然存在。

于是开始尝试内存排查工具**tracemalloc**来排查什么地方一直在增加内存



```python
def batch_insert(filepath):
  	tracemalloc.start()
    start_snapshot=tracemalloc.take_snapshot()  # 建立快照
    path = Path(filepath)
    for i, p in enumerate(sorted(path.glob('**/*.json')), start=1):
        with p.open(encoding='utf-8') as f:
            data = json.load(f)
				... # 内容整理
        with transaction.atomic():
            try:
              	# 批量插入数据库
                Regulation.objects.bulk_create(rules)
            except Exception as e:
                print(e)
        
        gc.collect()	# 主动释放内存，
       	end_snapshot = tracemalloc.take_snapshot()
        top_stats = snapshot.compare_to(start_snapshot, 'lineno')
        for index, stat in enumerate(top_stats[:50], 1):
            frame = stat.traceback[0]
            print("#%s: %s:%s: %.1f KiB"
                  % (index, frame.filename, frame.lineno, stat.size / 1024))
```

![RFK6GbLQ](https://static.19961002.xyz/img/2022/RFK6GbLQ.png)



![ewSJd0CP](https://static.19961002.xyz/img/2022/ewSJd0CP.png)

发现内存主要的增长是在第一行，而且后面也主要和MySQLdb有关，那么就去看看到底是怎么回事，点开源码在发现`django/utils/encoding.py:62`

```python
def force_str(s, encoding='utf-8', strings_only=False, errors='strict'):
    """
    Similar to smart_str(), except that lazy instances are resolved to
    strings, rather than kept as lazy objects.

    If strings_only is True, don't convert (some) non-string-like objects.
    """
    # Handle the common case first for performance reasons.
    if issubclass(type(s), str):
        return s
    if strings_only and is_protected_type(s):
        return s
    try:
        if isinstance(s, bytes):
            s = str(s, encoding, errors)
        else:
            s = str(s)
    except UnicodeDecodeError as e:
        raise DjangoUnicodeDecodeError(s, *e.args)
    return s
```

虽然有注解，但还是不明所以，那最起码看看是谁在调用这个方法总也行吧

```bash
grep -nr 'force_str('
```

发现还不少调用，那就找到关键的信息继续往上追溯

上面那么多虽然都有调用，但是与我们实际的使用情况不符，因为使用的mysql，所以发现红线部分挺符合预期，继续查看代码`django/db/backends/mysql/operations.py:171`

```python
def last_executed_query(self, cursor, sql, params):
    # With MySQLdb, cursor objects have an (undocumented) "_executed"
    # attribute where the exact query sent to the database is saved.
    # See MySQLdb/cursors.py in the source distribution.
    # MySQLdb returns string, PyMySQL bytes.
    return force_str(getattr(cursor, '_executed', None), errors='replace')
```

继续查找调用改方法的地方

```bash
grep -nr 'last_executed_query('
```

找到源码`django./db/backends/utils.py:113`

```python
@contextmanager
def debug_sql(self, sql=None, params=None, use_last_executed_query=False, many=False):
	start = time.monotonic()
  try:
  	yield
  finally:
    stop = time.monotonic()
    duration = stop - start
    if use_last_executed_query:
      sql = self.db.ops.last_executed_query(self.cursor, sql, params)
      try:
        times = len(params) if many else ''
        except TypeError:
          # params could be an iterator.
          times = '?'
          self.db.queries_log.append({
            'sql': '%s times: %s' % (times, sql) if many else sql,
            'time': '%.3f' % duration,
          })
          logger.debug(
            '(%.3f) %s; args=%s',
            duration,
            sql,
            params,
            extra={'duration': duration, 'sql': sql, 'params': params},
          )
```

研究一下代码发现，` sql = self.db.ops.last_executed_query(self.cursor, sql, params)`，在批量上传的时候，会将所有要上传的内容变成一条sql语句，到此为止目前还没发现有什么异常。

但是看到下面这一段，Django将生成的sql语句保存起来，那这个对象会清空之前保存的sql吗？

```python
self.db.queries_log.append({
                'sql': '%s times: %s' % (times, sql) if many else sql,
                'time': '%.3f' % duration,
            })
            logger.debug(
                '(%.3f) %s; args=%s',
                duration,
                sql,
                params,
                extra={'duration': duration, 'sql': sql, 'params': params},
            )
```

经过Debug发现，是不会的，每生成一条sql就添加到`self.db.queries_log`里，只要程序没有停止，那么这里边的sql就永远不会消失，所以真相大白，原来就是这个家伙导致的内存一直飙升。

继续向上看，寻找是否存在参数可以选择是否保存这些sql，在`django/db/backends/utils.py:97`发现这段代码

```python
def execute(self, sql, params=None):
    with self.debug_sql(sql, params, use_last_executed_query=True):
            return super().execute(sql, params)
```

发现确实存在一个参数`use_last_executed_query`，但是这个参数已经写死在代码里。。。

尝试修改源码将`use_last_executed_query`设置为False，运行代码发现问题解决。

后来有尝试将sql语句放入`self.db.queries_log`这段代码注释掉，运行代码仍然可以解决。

至此已经发现问题的真正根源出在什么地方了，但是通过修改源码的方式总归是不合适的，继续尝试有没有Django自带的方案。经过查找发现`django/db/__init.py:26`

```python
# Register an event to reset saved queries when a Django request is started.
def reset_queries(**kwargs):
    for conn in connections.all():
        conn.queries_log.clear()
```

于是尝试在代码中引入该方法

```python
from django.db import reset_queries

...
# 插入数据库之前首先清空
reset_queries()
# 批量插入数据库
Regulation.objects.bulk_create(rules)

```

发现问题完美的得到解决，完美！



后来在官方文档中发现，已经有这个方法的相关文档



![dmTAMrGI](https://static.19961002.xyz/img/2022/dmTAMrGI.png)

文档中还说只有在`DEBUG=True`时，这些sql语句才会保存起来以便有需要的时候查看sql。

这也解答了我心中的一个疑问，系统运行时产生的sql为什么要保存起来呢，现在看来是我知识浅薄了。



所以最终这个问题的解决方案有两个：

一、将`DEBUG`设置为False

二、手动清除，引入`django.db.reset_queries`



就第一种方案而言，只有在生产环境下，DEBUG选项才会为False，所以在自己的电脑上或者测试机上运行，还是第二种方案比较好。