# webpack的include，exclude的使用

使用插件以及loader的时候，为了提升速度或者精确指定需要被作用的文件，会使用到exclude，include这两个配置参数

> exclude是排除的作用，被排除的文件不需要被plugin/loader处理

> include是包含的作用，被包含的文件将会被plugin/loader处理

## 同时使用的情况下

- 同时使用，exclude优先级别大于include

```
{
  test: /\.(t|j)s(x?)$/,
  enforce: 'pre',
  use: [
    {
      loader: 'eslint-loader',
      options: {
        cache: true,
      },
    },
  ],
  include: [/src/],
  exclude: [/(node_modules)/, /seo/, /src/],
},
```

此时eslint-loader不会作用src目录下的所有文件，即使使用了include

- 只使用include 

```
{
  test: /\.(t|j)s(x?)$/,
  enforce: 'pre',
  use: [
    {
      loader: 'eslint-loader',
      options: {
        cache: true,
      },
    },
  ],
  include: [/src/],
},
```
此时eslint-loader 只会作用于src目录下的所有文件

- 只使用exclude

```
{
  test: /\.(t|j)s(x?)$/,
  enforce: 'pre',
  use: [
    {
      loader: 'eslint-loader',
      options: {
        cache: true,
      },
    },
  ],
  exclude: [/(node_modules)/, /seo/, /src/],
}
```
此时seo, src, node_modules不会被作用