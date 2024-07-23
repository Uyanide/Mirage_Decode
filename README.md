<small> 第一次写前端…… </small>

# 基于色阶分离以及像素交错的隐写图显形与制作工具

## Vercel链接
[光棱坦克工厂](https://mirage-decode.vercel.app)

## Github Pages链接
[光棱坦克工厂](https://uyanide.github.io/Mirage_Decode/)

## 使用方法
一看就懂

## 技术原理及思路来源
[Uyanide/Mirage_Image](https://github.com/Uyanide/Mirage_Image)

## 项目结构
- **resources**
  - **neko.ico** (图标)
  - **default.png** (默认显形源)
  - **buta.png** (默认表图)
  - **neko.png** (默认里图)

- **scripts**
  - **listeners** (事件监听、回调函数与辅助函数)
    - **DecodeListeners.js**
    - **DncodeListeners.js**
    - **UniversalListeners.js**
  - **mirageProcessors** (图像处理)
    - **MirageDecoder.js**
    - **MirageEncoder.js**
  - **DefaultArguments.js** (加载默认参数)
  - **init.js** (初始化)

- **styles**
  - **style.css**

- **index.html**
- **DefaultArguments.json** (默认参数配置)