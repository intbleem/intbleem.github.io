---
title: Elasticsearch相关汇总
slug: elasticsearch-nested
tags: [Elasticsearch, 技术笔记]
category: Tech
date: 2021-12-04
status: publish
---
在使用Elasticsearch的过程中，难免会要去官网翻看文档，由于目前还没有读完文档，以至于在找一些没用过的API时还挺费劲，有时候甚至还可能找不到。因此就把目前已经用到过的地方在这里汇总记录一下，方便以后碰到的话可以直接去查看。



## Index

- [https://www.elastic.co/guide/en/elasticsearch/reference/7.16/indices.html#index-management](https://www.elastic.co/guide/en/elasticsearch/reference/7.16/indices.html#index-management)



## Aliases

索引的一个别名，在某些情况下非常有用，比如在无缝切换索引的时候。

- [https://www.elastic.co/guide/en/elasticsearch/reference/7.16/aliases.html#aliases](https://www.elastic.co/guide/en/elasticsearch/reference/7.16/aliases.html#aliases)



## Mappings

索引的mapping定义十分重要，他决定了我们的数据是如何保存在索引内，以及保存的数据都有什么字段，各个字段的数据类型又是什么。

- [https://www.elastic.co/guide/en/elasticsearch/reference/7.16/mapping.html#mapping](https://www.elastic.co/guide/en/elasticsearch/reference/7.16/mapping.html#mapping)



## Setting

- [https://www.elastic.co/guide/en/elasticsearch/reference/7.16/index-modules.html#index-modules-settings](https://www.elastic.co/guide/en/elasticsearch/reference/7.16/index-modules.html#index-modules-settings)



## Query

### Full text queries

全文检索相关，主要包含[match query](https://www.elastic.co/guide/en/elasticsearch/reference/7.16/query-dsl-match-query.html)、[match_bool_prefix query](https://www.elastic.co/guide/en/elasticsearch/reference/7.16/query-dsl-match-bool-prefix-query.html)、[match_phrase query](https://www.elastic.co/guide/en/elasticsearch/reference/7.16/query-dsl-match-query-phrase.html)、[match_phrase_prefix query](https://www.elastic.co/guide/en/elasticsearch/reference/7.16/query-dsl-match-query-phrase-prefix.html)、[multi_match query](https://www.elastic.co/guide/en/elasticsearch/reference/7.16/query-dsl-multi-match-query.html)、[query_string query](https://www.elastic.co/guide/en/elasticsearch/reference/7.16/query-dsl-query-string-query.html)、[match_bool_prefix query](https://www.elastic.co/guide/en/elasticsearch/reference/7.16/query-dsl-match-bool-prefix-query.html)、[match_phrase query](https://www.elastic.co/guide/en/elasticsearch/reference/7.16/query-dsl-match-query-phrase.html)、[match_phrase_prefix query](https://www.elastic.co/guide/en/elasticsearch/reference/7.16/query-dsl-match-query-phrase-prefix.html)、[multi_match query](https://www.elastic.co/guide/en/elasticsearch/reference/7.16/query-dsl-multi-match-query.html)、[query_string query](https://www.elastic.co/guide/en/elasticsearch/reference/7.16/query-dsl-query-string-query.html)等

- [https://www.elastic.co/guide/en/elasticsearch/reference/7.16/full-text-queries.html#full-text-queries](https://www.elastic.co/guide/en/elasticsearch/reference/7.16/full-text-queries.html#full-text-queries)



### Compound queries

混合索引，包含[bool query](https://www.elastic.co/guide/en/elasticsearch/reference/7.16/query-dsl-bool-query.html)、[boosting query](https://www.elastic.co/guide/en/elasticsearch/reference/7.16/query-dsl-boosting-query.html)、[constant_score query](https://www.elastic.co/guide/en/elasticsearch/reference/7.16/query-dsl-constant-score-query.html)、[dis_max query](https://www.elastic.co/guide/en/elasticsearch/reference/7.16/query-dsl-dis-max-query.html)、[function_score query](https://www.elastic.co/guide/en/elasticsearch/reference/7.16/query-dsl-function-score-query.html)

- [https://www.elastic.co/guide/en/elasticsearch/reference/7.16/compound-queries.html](https://www.elastic.co/guide/en/elasticsearch/reference/7.16/compound-queries.html)



### Function score query

用户可以通过自定义一个或多个查询语句来提高某些文档的比分权重，

- [https://www.elastic.co/guide/en/elasticsearch/reference/7.16/query-dsl-function-score-query.html#query-dsl-function-score-query](https://www.elastic.co/guide/en/elasticsearch/reference/7.16/query-dsl-function-score-query.html#query-dsl-function-score-query)

还可以通过**script_score**使用脚本给每个文档重新打分

- [https://www.elastic.co/guide/en/elasticsearch/reference/7.16/query-dsl-function-score-query.html#function-script-score](https://www.elastic.co/guide/en/elasticsearch/reference/7.16/query-dsl-function-score-query.html#function-script-score)



### Highlight

- [https://www.elastic.co/guide/en/elasticsearch/reference/7.16/highlighting.html#highlighting](https://www.elastic.co/guide/en/elasticsearch/reference/7.16/highlighting.html#highlighting)



### Prefix query

使用前缀查询可以返回前缀为指定前缀的文档，多用于即时搜索一类的提示。

- [https://www.elastic.co/guide/en/elasticsearch/reference/7.16/query-dsl-prefix-query.html#query-dsl-prefix-query](https://www.elastic.co/guide/en/elasticsearch/reference/7.16/query-dsl-prefix-query.html#query-dsl-prefix-query)



### Match phrase prefix query

当需要对一个短语或词组进行前缀查询时，就需要用到来进行搜索了

- [https://www.elastic.co/guide/en/elasticsearch/reference/7.16/query-dsl-match-query-phrase-prefix.html#query-dsl-match-query-phrase-prefix](https://www.elastic.co/guide/en/elasticsearch/reference/7.16/query-dsl-match-query-phrase-prefix.html#query-dsl-match-query-phrase-prefix)



### Named query

通过使用`_name`参数可以在多字段查询时知道是哪个子查询语句命中了该文档，并将结果返回在每个响应文档的`matched_queries`字段内。

- [https://www.elastic.co/guide/en/elasticsearch/reference/7.16/query-dsl-bool-query.html#named-queries](https://www.elastic.co/guide/en/elasticsearch/reference/7.16/query-dsl-bool-query.html#named-queries)



### Nested query

- [https://www.elastic.co/guide/en/elasticsearch/reference/7.16/query-dsl-nested-query.html#query-dsl-nested-query](https://www.elastic.co/guide/en/elasticsearch/reference/7.16/query-dsl-nested-query.html#query-dsl-nested-query)



### Exists query

在某些情况下，并不是所有的字段都存在确切的值，可以通过**Exists**来或者筛选包含某些字段的文档，同时配合**must_not**可以来筛选所有存在该字段的文档。

- [https://www.elastic.co/guide/en/elasticsearch/reference/7.16/query-dsl-exists-query.html#query-dsl-exists-query](https://www.elastic.co/guide/en/elasticsearch/reference/7.16/query-dsl-exists-query.html#query-dsl-exists-query)



## Scripts

ES的脚本语言是`painless`，语法与Java类似，可直接按照Java的语法来编写检索脚本，具体可见地址：[Shard API ](https://www.elastic.co/guide/en/elasticsearch/painless/7.16/painless-api-reference-shared.html)。

这里只记录一下自己使用到的，以便以后再遇到可直接CV。

### 删除数组内满足条件的元素

使用**removeIf**来完成，例如删除ID为10的元素

```json
{
  "script": {
    "source": "ctx._source.members.removeIf(list_item -> list_item.id == params.member_id)",
    "lang": "painless",
    "params": {
      "member_id": 10
    }
  }
}
```



### 判断数组内是否包含某一个对象

使用**contains**来完成，返回包含`name`为**张三**的文档

```json
{
  "script": {
    "source": "ctx._source.members.contains(params.name)",
    "lang": "painless",
    "params": {
      "name": "张三"
    }
  }
}
```



### 根据时间提高某些文档的权重

使用时间格式化方法**toInstant**和**toEpochMilli**来完成，将时间转换成毫秒级权重因子

```json
{
    "script": {
        "lang": "painless", 
        "source": "double dateScore; try {dateScore = Math.abs(doc['enforcementDate'].value.toInstant().toEpochMilli()/1e12);} catch (Exception e) {dateScore=0;} return dateScore;"
    }
}
```

