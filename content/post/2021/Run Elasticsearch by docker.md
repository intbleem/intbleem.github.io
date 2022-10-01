---
title: Run Elasticsearch by docker
slug: docker-elasticsearch
tags: [Elasticsearch, Docker, 技术笔记]
category: Tech
date: 2021-04-30
status: publish
---


**1. Download the docker image of Elasticsearch, taking version 7.6.0 as an example**

```bash
	docker pull elasticsearch:7.6.0
```

**2. Create a container and run it.**

if your command is:


```bash
   docker run -d --name es -p 9200:9200 -p 9300:9300 elasticsearch:7.6.0
```
It may exit shortly after starting. To find out the reason, view logs by log command:

```bash
   docker logs es
```
Some error message like ``max virtual memory areas vm.max_map_count [65530] is too low, increase to at least [262144]`` may appear. Go the following command:

```bash
   # change the variable
   sysctl -w vm.max_map_count=262144
   # check the variable value
   sysctl -n vm.max_map_count
```

If the error message is ``the default discovery settings are unsuitable for production use; at least one of [discovery.seed_hosts, discovery.seed_providers, cluster.initial_master_nodes] must be configured``, which means the container has wrong configuration and can be corrected by setting those prompted environment variables or setting to standalone development mode by ``discovery.type=single-node``.

   In short, the correct command is:

```bash
   docker run -d --name es -p 9200:9200 -p 9300:9300 -e discovery.type=single-node elasticsearch:7.6.0
```

## Using IK Chinese segmentation plugin.

**1. Download the plugin.**

The plugin version must equal the Elasticsearch version. Version 7.6.0 download link is <https://github.com/medcl/elasticsearch-analysis-ik/releases/download/v7.6.0/elasticsearch-analysis-ik-7.6.0.zip>。

**2. Unzip to an empty directory, which is referred to as  *`$IK`***.

**3. Copy the *`$IK`* into the directory of the container's plugin.**

```bash
   docker cp $IK es:/usr/share/elasticsearch/plugins/ik
```

This plugin provides analyzer and tokenizer named `ik_smart` and `ik_max_word` where `ik_smart` splits by the coarsest granularity, while `ik_max_word` will exhaust all kinds of split combinations.

Find more info at [IK](https://github.com/medcl/elasticsearch-analysis-ik).