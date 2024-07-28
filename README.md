<small> 第一次写前端…… </small>

# 基于色阶分离与像素交错的隐写图显形与制作工具

## 链接 (已使用Cloudflare全面代理)
[光棱坦克工厂](https://prism.uyanide.com/)

## 使用方法
一看就懂，不懂也能用 :)

## 技术原理及思路来源
[Uyanide/Mirage_Image](https://github.com/Uyanide/Mirage_Image)

## 引用库
- **[jpeg-js](https://github.com/jpeg-js/jpeg-js)** (用于统一不同浏览器编码JPEG的行为)
- **[piexifjs](https://github.com/hMatoba/piexifjs)** (用于读写JPEG Metadata)
- **[node-png-metadata](https://github.com/kujirahand/node-png-metadata)** (用于读写PNG Chunk)

## 项目结构
- **resources**
  - **neko.ico** (图标)
  - **default.png** (默认显形源)
  - **buta.jpg** (默认表图)
  - **neko.jpg** (默认里图)

- **scripts**
  - **lib** (第三方库)
    - **[encoder.js](https://github.com/jpeg-js/jpeg-js/blob/master/lib/encoder.js)**
    - **[piexif.js](https://github.com/hMatoba/piexifjs/blob/master/piexif.js)**
    - **[png-metadata.js](https://github.com/kujirahand/node-png-metadata/blob/master/src/lib/png-metadata.js)**
  - **listeners** (事件监听、回调与辅助函数)
    - **DecodeListeners.js**
    - **EncodeListeners.js**
    - **UniversalListeners.js**
  - **prismProcessor** (图像处理)
    - **PrismDecoder.js**
    - **PrismEncoder.js**
  - **DefaultArguments.js** (加载默认参数)
  - **init.js** (初始化)

- **styles**
  - **style.css**
  - **switch.css**

- **index.html**
- **DefaultArguments.json** (默认参数配置)
