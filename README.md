# weex-multiple-page
> weex多页模板

# Features
+ 根据视图目录生成多入口
+ 不同视图目录可生成不同的MD5版本号，可用于版本控制

# 架构目录
```

├── src
│   ├── assets（公共资源）
│   │   ├── fonts
│   │   ├── img
│   │   └── css
│   ├── components（公共组件）
│   ├── config（配置）
│   ├── mixins（混入）
│   ├── utils（公共工具）
│   ├── pages（视图）
│   │    └── ...
│   └── main.js
```