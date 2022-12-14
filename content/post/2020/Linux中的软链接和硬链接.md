---
title: Linux中的软链接和硬链接
slug: Linux-hardlink-softlink
tags: [Linux,unix]
category: 技术
date: 2020-11-24
status: publish
subtitle: Linux学习记录。
---
## Linux文件系统
在 UNIX 系统中，操作系统为磁盘上的文本与图像、鼠标与键盘等输入设备及网络交互等 I/O 操作设计了一组通用 API，使他们被处理时均可统一使用字节流方式。

换言之，**UNIX 系统中除进程之外的一切皆是文件**，而 Linux 保持了这一特性。为了便于文件的管理，Linux 还引入了目录（有时亦被称为文件夹）这一概念。目录使文件可被分类管理，且目录的引入使 Linux 的文件系统形成一个层级结构的目录树。

### Linux 系统的顶层目录结构
```
/              根目录
├── bin     存放用户二进制文件
├── boot    存放内核引导配置文件
├── dev     存放设备文件
├── etc     存放系统配置文件
├── home    用户主目录
├── lib     动态共享库
├── lost+found  文件系统恢复时的恢复文件
├── media   可卸载存储介质挂载点
├── mnt     文件系统临时挂载点
├── opt     附加的应用程序包
├── proc    系统内存的映射目录，提供内核与进程信息
├── root    root 用户主目录
├── sbin    存放系统二进制文件
├── srv     存放服务相关数据
├── sys     sys 虚拟文件系统挂载点
├── tmp     存放临时文件
├── usr     存放用户应用程序
└── var     存放邮件、系统日志等变化文件
```
Linux 与其他类 UNIX 系统一样并不区分文件与目录：目录是记录了其他文件名的文件。使用命令 mkdir 创建目录时，若期望创建的目录的名称与现有的文件名（或目录名）重复，则会创建失败。

## 硬链接与软链接的联系与区别
我们知道文件都有文件名与数据，这在 Linux 上被分成两个部分：用户数据 (user data) 与元数据 (metadata)。用户数据，即文件数据块 (data block)，数据块是记录文件真实内容的地方；而元数据则是文件的附加属性，如文件大小、创建时间、所有者等信息。在 Linux 中，元数据中的 inode 号（inode 是文件元数据的一部分但其并不包含文件名，inode 号即索引节点号）才是文件的唯一标识而非文件名。文件名仅是为了方便人们的记忆和使用，系统或程序通过 inode 号寻找正确的文件数据块。

在 Linux 系统中查看 inode 号可使用命令 stat 或 ls -i（若是 AIX 系统，则使用命令 istat）。
```bash
 # stat /home/harris/source/glibc-2.16.0.tar.xz
 File: `/home/harris/source/glibc-2.16.0.tar.xz'
 Size: 9990512      Blocks: 19520      IO Block: 4096   regular file
Device: 807h/2055d      Inode: 2485677     Links: 1
Access: (0600/-rw-------)  Uid: ( 1000/  harris)   Gid: ( 1000/  harris)
...
...
# ls -i -F /home/harris/Desktop/glibc.tar.xz
2485677 /home/harris/Desktop/glibc.tar.xz
```

为解决文件的共享使用，Linux 系统引入了两种链接：硬链接 (hard link) 与软链接（又称符号链接，即 soft link 或 symbolic link）。链接为 Linux 系统解决了文件的共享使用，还带来了隐藏文件路径、增加权限安全及节省存储等好处。若一个 inode 号对应多个文件名，则称这些文件为硬链接。换言之，硬链接就是同一个文件使用了多个别名（见 图 2.hard link 就是 file 的一个别名，他们有共同的 inode）。硬链接可由命令 link 或 ln 创建。

### 创建硬链接

```bash
link oldfile newfile
ln oldfile newfile
```
查找有相同 inode 号的文件
```bash
df -i --print-type
```


由于硬链接是有着相同 inode 号仅文件名不同的文件，因此硬链接存在以下几点特性

- 文件有相同的 inode 及 data block；
- 只能对已存在的文件进行创建；
- 不能交叉文件系统进行硬链接的创建；
- 不能对目录进行创建，只可对文件创建；
- 删除一个硬链接文件并不影响其他有相同 inode 号的文件。

硬链接不能对目录创建是受限于文件系统的设计。现 Linux 文件系统中的目录均隐藏了两个个特殊的目录：当前目录（.）与父目录（..）。查看这两个特殊目录的 inode 号可知其实这两目录就是两个硬链接。若系统允许对目录创建硬链接，则会产生目录环。

软链接与硬链接不同，若文件用户数据块中存放的内容是另一文件的路径名的指向，则该文件就是软连接。软链接就是一个普通文件，只是数据块内容有点特殊。软链接有着自己的 inode 号以及用户数据块。因此软链接的创建与使用没有类似硬链接的诸多限制：
- 软链接有自己的文件属性及权限等；
- 可对不存在的文件或目录创建软链接；
- 软链接可交叉文件系统；
- 软链接可对文件或目录创建；
- 创建软链接时，链接计数 i_nlink 不会增加；
- 删除软链接并不影响被指向的文件，但若被指向的原文件被删除，则相关软连接被称为死链接（即 dangling link，若被指向路径文件被重新创建，死链接可恢复为正常的软链接）。

### 创建软连接

```bash
ln -s 源文件路径 目标路径
```
我们尝试对不存在的文件创建软连接
```bash
# ls -li
 total 0

 // 可对不存在的文件创建软链接
 # ln -s old.file soft.link
 # ls -liF
 total 0
 789467 lrwxrwxrwx 1 root root 8 Sep  1 18:00 soft.link -> old.file 

 // 由于被指向的文件不存在，此时的软链接 soft.link 就是死链接
 # cat soft.link 
 cat: soft.link: No such file or directory 

 // 创建被指向的文件 old.file，soft.link 恢复成正常的软链接
 # echo "This is an original file_A" >> old.file
 # cat soft.link
 This is an original file_A

 // 对不存在的目录创建软链接
 # ln -s old.dir soft.link.dir
 # mkdir -p old.dir/test
 # tree . -F --inodes
 .
├── [ 789497]  old.dir/
│   └── [ 789498]  test/
├── [ 789495]  old.file
├── [ 789495]  soft.link -> old.file
└── [ 789497]  soft.link.dir -> old.dir/
```
当然软链接的用户数据也可以是另一个软链接的路径，其解析过程是递归的。但需注意：软链接创建时原文件的路径指向使用绝对路径较好。使用相对路径创建的软链接被移动后该软链接文件将成为一个死链接，因为链接数据块中记录的亦是相对路径指向。